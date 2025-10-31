package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/checkout/session"
)

type PaymentService struct {
	server      *server.Server
	paymentRepo *repository.PaymentRepository
	orderRepo   *repository.OrderRepository
	
}

func NewPaymentService(s *server.Server, paymentRepo *repository.PaymentRepository, orderRepo *repository.OrderRepository) *PaymentService {
	return &PaymentService{
		server:    s,
		paymentRepo: paymentRepo,
		orderRepo: orderRepo,
	}
}


func (ps *PaymentService) ProcessKhaltiPayment(c echo.Context, payload *payment.KhaltiPaymentPayload) ( *payment.KhaltiPaymentResponse,error) {

	ctx := c.Request().Context()

	// 1️⃣ Idempotency check — has payment already been initiated for this order?
	// existing, err := ps.paymentRepo.GetPaymentByOrderID(ctx, payload.PurchaseOrderID)
	// if err != nil && err != pgx.ErrNoRows {
	// 	return nil, fmt.Errorf("check existing payment: %w", err)
	// }
    // if existing != nil && existing.Status == "success" {
	// 	return nil, echo.NewHTTPError(http.StatusConflict, "Payment already completed for this order")
	// }
    
	// 2️⃣ Prepare Khalti request
	body := map[string]interface{}{
		"return_url": ps.server.Config.Khalti.ReturnURL,
		"website_url": ps.server.Config.Khalti.WebsiteURL,
		"amount": int(payload.Amount * 100), // Khalti uses paisa
		"purchase_order_id": payload.PurchaseOrderID,
		"purchase_order_name": payload.PurchaseOrderName,
	}
	// 3️⃣ Send request to Khalti initiate endpoint

	reqBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", ps.server.Config.Khalti.InitiateURL, bytes.NewBuffer(reqBody))
	req.Header.Set("Authorization", "Key "+ps.server.Config.Khalti.SecretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("khalti initiate error: %w", err)
	}
	defer resp.Body.Close()

	var khaltiResp payment.KhaltiPaymentResponse

	if err := json.NewDecoder(resp.Body).Decode(&khaltiResp); err != nil {
		return nil,fmt.Errorf("decode khalti response: %w", err)
	}

	// 4️⃣ Store payment info
	p := &payment.OrderPayment{
		OrderID:        payload.PurchaseOrderID,
		PaymentGateway: "khalti",
		TransactionID:  khaltiResp.Pidx,
		Amount:         payload.Amount,
		Status:         "initiated",
		Method:         "khalti",
	}
	if err := ps.paymentRepo.CreateOrUpdateOrderPayment(ctx, p); err != nil {
		return nil,fmt.Errorf("store payment info: %w", err)
	}


	return &khaltiResp, nil
}



func (ps *PaymentService) ProcessStripeCheckout(c echo.Context, payload *payment.StripePaymentPayload) ( *payment.StripePaymentResponse,error) {

	ctx := c.Request().Context()

	stripe.Key = ps.server.Config.Stripe.SecretKey
    
	successURL :=  stripe.String(fmt.Sprintf(
			"%s?session_id={CHECKOUT_SESSION_ID}&purchase_order_id=%s&purchase_order_name=%s&amount=%f", 
			ps.server.Config.Stripe.SuccessURL,
			url.QueryEscape(payload.PurchaseOrderID),
			url.QueryEscape(payload.PurchaseOrderName),
			payload.Amount,
		))


	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL:successURL,
		CancelURL:  stripe.String(fmt.Sprintf("%s/?purchase_order_id=%s", ps.server.Config.Stripe.CancelURL,url.QueryEscape(payload.PurchaseOrderID),)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("inr"), 
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(payload.PurchaseOrderName),
					},
					UnitAmount: stripe.Int64(int64(payload.Amount * 100)), // Stripe uses cents
				},
				Quantity: stripe.Int64(1),
			},
		},
	}
    
	s, err := session.New(params)

	if err != nil {
		return nil, fmt.Errorf("create stripe session: %w", err)
	}

	p := &payment.OrderPayment{
		OrderID:        payload.PurchaseOrderID,
		PaymentGateway: "stripe",
		TransactionID:  s.ID,
		Amount:         payload.Amount,
		Status:         "initiated",
		Method:         "stripe",
	}
	if err := ps.paymentRepo.CreateOrUpdateOrderPayment(ctx, p); err != nil {
		return nil, fmt.Errorf("store payment info: %w", err)
	}
    res:= &payment.StripePaymentResponse{
		PaymentUrl: s.URL,
	}
	return res, nil
}

func (ps *PaymentService) VerifyKhaltiPayment(c echo.Context, payload *payment.KhaltiVerifyPaymentPayload) (*payment.KhaltiVerifyPaymentResponse,error) {
	ctx := c.Request().Context()
	pidx := payload.Pidx

	// 1️⃣ Verify payment with Khalti
	req, _ := http.NewRequest("POST", ps.server.Config.Khalti.VerifyURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"pidx":"%s"}`, pidx))))
	req.Header.Set("Authorization", "Key "+ps.server.Config.Khalti.SecretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil,fmt.Errorf("khalti verify error: %w", err)
	}
	defer resp.Body.Close()

	var verifyResp payment.KhaltiVerifyPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return nil,fmt.Errorf("decode khalti verify: %w", err)
	}

	status := verifyResp.Status

	// 2️⃣ Update payment and order status
	if status == "Completed" {
		if orderID, err := ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, "success"); err == nil {
			if err := ps.orderRepo.MarkOrderPaidAndCheckout(ctx, orderID); err != nil {
				return nil, fmt.Errorf("update order: %w", err)
			}
		}
		
	} else {
		_ ,_= ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, status)
	}

	return &verifyResp,nil
}



func (ps *PaymentService) VerifyAndUpdateStripePayment(
	ctx context.Context,
	payload *payment.StripeVerifyPayload,
) (string, string, error) {

	sessionID := payload.SessionID

	// 1️⃣ Fetch Checkout Session from Stripe
	stripe.Key = ps.server.Config.Stripe.SecretKey

	sess, err := session.Get(sessionID, nil)
	if err != nil {
		return "", "", fmt.Errorf("fetch stripe session: %w", err)
	}

	// 2️⃣ Determine payment status
	status := string(sess.PaymentStatus) // "paid", "unpaid", "no_payment_required"
	var orderID string

	// 3️⃣ Update local payment and order based on status
	switch status {
    case "paid":
		// Update payment status in DB
		if oid, err := ps.paymentRepo.UpdatePaymentStatus(ctx, sessionID, "success"); err == nil {
			orderID = oid
			// Mark order as paid
			if err := ps.orderRepo.MarkOrderPaidAndCheckout(ctx, orderID); err != nil {
				return "", "", fmt.Errorf("update order: %w", err)
			}
		}
	case "unpaid":
		oid, _ := ps.paymentRepo.UpdatePaymentStatus(ctx, sessionID, "failed")
		orderID = oid
	default:
		// fallback for any other payment state
		oid, _ := ps.paymentRepo.UpdatePaymentStatus(ctx, sessionID, string(sess.PaymentStatus))
		orderID = oid
	}

	return orderID, status, nil
}



func (ps *PaymentService) VerifyAndUpdateKhaltiPayment(ctx context.Context, payload *payment.KhaltiCallbackPayload) (string, string, error) {
	pidx := payload.Pidx

	// 1️⃣ Verify with Khalti
	req, _ := http.NewRequest("POST", ps.server.Config.Khalti.VerifyURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"pidx":"%s"}`, pidx))))
	req.Header.Set("Authorization", "Key "+ps.server.Config.Khalti.SecretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("khalti verify error: %w", err)
	}
	defer resp.Body.Close()

	var verifyResp payment.KhaltiVerifyPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return "", "", fmt.Errorf("decode khalti verify: %w", err)
	}

	status := verifyResp.Status
	var orderID string

	// 2️⃣ Update payment + order
	if status == "Completed" {
		if oid, err := ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, "success"); err == nil {
			orderID = oid
			if err := ps.orderRepo.MarkOrderPaidAndCheckout(ctx, orderID); err != nil {
				return "", "", fmt.Errorf("update order: %w", err)
			}
		}
	} else {
		oid, _ := ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, "failed")
		orderID = oid
	}

	return orderID, status, nil
}

func (ps *PaymentService) StripeCancelPayment(c echo.Context) error {
    ctx := c.Request().Context()
    orderID := c.QueryParam("purchase_order_id")
    if orderID == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "purchase_order_id is required")
    }

    // 1️⃣ Update payment as failed
    if _, err := ps.paymentRepo.UpdatePaymentStatus(ctx, orderID, "failed"); err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("update payment failed: %v", err))
    }

    // 3️⃣ Redirect user to frontend failure page
    return c.Redirect(http.StatusSeeOther, fmt.Sprintf("%s/payment-failed?purchase_order_id=%s", 
        ps.server.Config.Stripe.FrontEndURL, orderID))
}
