package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"net/http"
	"net/url"

	"github.com/gitSanje/khajaride/internal/lib/events"
	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/model/payout"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/account"
	"github.com/stripe/stripe-go/v83/accountlink"

	"github.com/stripe/stripe-go/v83/checkout/session"
)

type PaymentService struct {
	server      *server.Server
	paymentRepo *repository.PaymentRepository
	orderRepo   *repository.OrderRepository
}

func NewPaymentService(s *server.Server, paymentRepo *repository.PaymentRepository, orderRepo *repository.OrderRepository) *PaymentService {
	return &PaymentService{
		server:      s,
		paymentRepo: paymentRepo,
		orderRepo:   orderRepo,
	}
}

// -- ==================================================
// -- KHALTI PAYMENT
// -- ==================================================

func (ps *PaymentService) ProcessKhaltiPayment(c echo.Context, payload *payment.KhaltiPaymentPayload) (*payment.KhaltiPaymentResponse, error) {

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
		"return_url":          ps.server.Config.Khalti.ReturnURL,
		"website_url":         ps.server.Config.Khalti.WebsiteURL,
		"amount":              int(payload.Amount * 100), // Khalti uses paisa
		"purchase_order_id":   payload.PurchaseOrderID,
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
		return nil, fmt.Errorf("decode khalti response: %w", err)
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
		return nil, fmt.Errorf("store payment info: %w", err)
	}

	return &khaltiResp, nil
}

func (ps *PaymentService) VerifyKhaltiPayment(c echo.Context, payload *payment.KhaltiVerifyPaymentPayload) (*payment.KhaltiVerifyPaymentResponse, error) {
	ctx := c.Request().Context()
	pidx := payload.Pidx

	// 1️⃣ Verify payment with Khalti
	req, _ := http.NewRequest("POST", ps.server.Config.Khalti.VerifyURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"pidx":"%s"}`, pidx))))
	req.Header.Set("Authorization", "Key "+ps.server.Config.Khalti.SecretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("khalti verify error: %w", err)
	}
	defer resp.Body.Close()

	var verifyResp payment.KhaltiVerifyPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return nil, fmt.Errorf("decode khalti verify: %w", err)
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
		_, _ = ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, status)
	}

	return &verifyResp, nil
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

// -- ==================================================
// -- STRIPE PAYMENT
// -- ==================================================

func (ps *PaymentService) ProcessStripeCheckout(c echo.Context, payload *payment.StripePaymentPayload) (*payment.StripePaymentResponse, error) {

	ctx := c.Request().Context()
	accountId, err := ps.paymentRepo.GetStripeAccountID(ctx, payload.VendorUserId)
	if err != nil {
		return nil, fmt.Errorf("error fetching the connectAccountID:%s", err)
	}

	if accountId == "" {
		return nil, fmt.Errorf("stripe connected account not found for vendor user ID: %s", payload.VendorUserId)
	}
	stripe.Key = ps.server.Config.Stripe.SecretKey

	successURL := stripe.String(fmt.Sprintf(
		"%s?session_id={CHECKOUT_SESSION_ID}&purchase_order_id=%s&purchase_order_name=%s&amount=%f",
		ps.server.Config.Stripe.SuccessURL,
		url.QueryEscape(payload.PurchaseOrderID),
		url.QueryEscape(payload.PurchaseOrderName),
		payload.Amount,
	))
	fee := int64(payload.Amount * 100 * 0.03)

// 	Parse request → apply rules → create CheckoutSession object →
//   determine payment mode →
//     create PaymentIntent (status: requires_payment_method) →
//       wait for customer to complete checkout →
//         confirm PaymentIntent →
//           create Charge →
//             apply application_fee →
//               create ApplicationFee object →
//                 run Connect transfer →
//                   update balances →
//                     fire webhooks

    //https://docs.stripe.com/connect/destination-charges
	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: successURL,
		CancelURL:  stripe.String(fmt.Sprintf("%s/?purchase_order_id=%s", ps.server.Config.Stripe.CancelURL, url.QueryEscape(payload.PurchaseOrderID))),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(payload.PurchaseOrderName),
					},
					UnitAmount: stripe.Int64(int64(payload.Amount * 100)), // Stripe uses cents
				},
				Quantity: stripe.Int64(1),
			},
		},
		PaymentIntentData: &stripe.CheckoutSessionPaymentIntentDataParams{
			ApplicationFeeAmount: stripe.Int64(fee),
			//destination charges
			TransferData: &stripe.CheckoutSessionPaymentIntentDataTransferDataParams{
				Destination: stripe.String(accountId),
			},
			Metadata: map[string]string{
				"purchase_order_id": payload.PurchaseOrderID,
				"vendor_user_id":    payload.VendorUserId,
				"amount":            fmt.Sprintf("%f", payload.Amount),
				"stripe_connect_acc_id":accountId,
			},
		},
		Metadata: map[string]string{
				"purchase_order_id": payload.PurchaseOrderID,
				"vendor_user_id":    payload.VendorUserId,
				"amount":            fmt.Sprintf("%f", payload.Amount),
				"stripe_connect_acc_id":accountId,
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
	res := &payment.StripePaymentResponse{
		PaymentUrl: s.URL,
	}
	return res, nil
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
	vendorUserId := sess.Metadata["vendor_user_id"]
	StripeConnectAccId:= sess.Metadata["stripe_connect_acc_id"]
	// 2️⃣ Determine payment status
	status := string(sess.PaymentStatus) // "paid", "unpaid", "no_payment_required"
	var orderID string
     amount := float64(sess.AmountTotal) / 100
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
			var payoutAccId string
			if payoutAccId, err = ps.paymentRepo.GetPayoutAccountID(ctx, vendorUserId); err != nil {
				return "", "", fmt.Errorf("get payout accountid: %w", err)
			}
			p := &payout.Payout{
				VendorUserID: stripe.String(vendorUserId),
				Sender:         "customer",
				OrderID:        stripe.String(orderID),
				PayoutType:     "user_payout",
				AccountID:      stripe.String(payoutAccId),
				Method:         "stripe",
				Amount:        amount,
				TransactionRef: stripe.String(sessionID),
				Status: "completed",
			}

			if _,err := ps.paymentRepo.CreatePayout(ctx, p); err != nil {
				return "", "", fmt.Errorf("create payout: %w", err)
			}
			
			events.PublishPayoutRequested(ctx, events.PayoutRequestedEvent{
                OrderID:      orderID,
				VendorUserID: vendorUserId,
				Amount:       amount,
				SessionId: sessionID,
				PayoutAccId:payoutAccId,
				StripeConnectAccId: StripeConnectAccId,
			})
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

func (ps *PaymentService) CreateOnboardingAccountWithLink(c echo.Context, payload *payment.OnboardingPayload) (*payment.OnboardingResponse, error) {
	ctx := c.Request().Context()
	stripe.Key = ps.server.Config.Stripe.SecretKey

	// 1️⃣ Check whether vendor already has a connected account stored
	acctID, err := ps.paymentRepo.GetStripeAccountID(ctx, payload.VendorUserId)
	if err != nil || acctID == "" {

		// No connected account yet -> create one
		acctParams := &stripe.AccountParams{
			Type:    stripe.String(stripe.AccountTypeExpress),
			Country: stripe.String("US"),
			Capabilities: &stripe.AccountCapabilitiesParams{
				Transfers: &stripe.AccountCapabilitiesTransfersParams{Requested: stripe.Bool(true)},
			},
			BusinessType: stripe.String("individual"),
			BusinessProfile: &stripe.AccountBusinessProfileParams{
				ProductDescription: stripe.String("Vendor payouts on Khajaride"),
				URL:                stripe.String("https://khajaride.com"),
			},
		}
		acct, err := account.New(acctParams)
		if err != nil {
			return nil, fmt.Errorf("failed to create account: %w", err)
		}

		// Store connected account info in DB
		payout := &payout.PayoutAccount{
			OwnerID:            stripe.String(payload.VendorUserId),
			OwnerType:          "vendor",
			Method:             "stripe",
			StripeAccountID:    stripe.String(acct.ID),
			Currency:           "USD",
			IsDefault:          true,
			Mode:               "online",
			Code:               "STRIPE",
			Verified:           false,
			VerificationStatus: "pending",
		}

		if err := ps.paymentRepo.CreatePayoutAccount(c.Request().Context(), payout); err != nil {
			return nil, fmt.Errorf("failed to save payout account: %w", err)
		}

		acctID = acct.ID

	}

	acct, err := account.GetByID(acctID, &stripe.AccountParams{})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Stripe account: %v", err)
	}
	status := "verified"
	if len(acct.Requirements.CurrentlyDue) > 0 || len(acct.Requirements.EventuallyDue) > 0 {
		status = "incomplete"
	}
	if status == "verified" {
		return &payment.OnboardingResponse{
			URL:    nil,
			Status: "verified",
		}, nil
	}

	// 2️⃣ Create an onboarding account link
	link, err := ps.CreateOnboardingLink(ctx, acctID, payload.VendorUserId)

	if err != nil {
		return nil, fmt.Errorf("failed to create account link: %w", err)
	}
	return &payment.OnboardingResponse{
		URL:    &link,
		Status: "incomplete",
	}, nil

}

func (ps *PaymentService) CreateOnboardingLink(ctx context.Context, accountID string, vendorUserId string) (string, error) {
	stripe.Key = ps.server.Config.Stripe.SecretKey
	params := &stripe.AccountLinkParams{
		Account:    stripe.String(accountID),
		RefreshURL: stripe.String("http://localhost:8080/api/v1/payments/stripe/onboarding/refresh?account_id=" + accountID + "&vendor_user_id=" + vendorUserId),
		ReturnURL:  stripe.String("http://localhost:8080/api/v1/payments/stripe/onboarding/return?account_id=" + accountID + "&vendor_user_id=" + vendorUserId),
		Type:       stripe.String("account_onboarding"),
		CollectionOptions: &stripe.AccountLinkCollectionOptionsParams{
			Fields: stripe.String("eventually_due"),
		},
	}
	result, err := accountlink.New(params)
	if err != nil {
		return "", err
	}
	return result.URL, nil
}

func (ps *PaymentService) UpdateStripePayoutAccount(ctx context.Context, userVendorID string, acct *stripe.Account) error {

	var accountIdentifier, accountName, bankName, branchName string
	if acct.ExternalAccounts != nil && len(acct.ExternalAccounts.Data) > 0 {
		if bank := acct.ExternalAccounts.Data[0].BankAccount; bank != nil {
			accountIdentifier = bank.Last4
			accountName = bank.AccountHolderName
			bankName = bank.BankName
			branchName = ""
		}
	}
	updatePayload := &payout.PayoutAccountUpdatePayload{
		OwnerID:            userVendorID,
		StripeAccountID:    acct.ID,
		AccountIdentifier:  accountIdentifier,
		AccountName:        accountName,
		BankName:           bankName,
		BranchName:         branchName,
		Verified:           true,
		VerificationStatus: "verified",
	}
	return ps.paymentRepo.UpdateStripePayoutAccount(ctx, updatePayload)
}

func (ps *PaymentService) CreatePayout(ctx context.Context, p *payout.Payout) (string,error) {
	return ps.paymentRepo.CreatePayout(ctx, p)
}

func (ps *PaymentService) GetPayoutAccountID(ctx context.Context, vendorUserID string) (string, error) {
	return ps.paymentRepo.GetPayoutAccountID(ctx, vendorUserID)
}


func (ps *PaymentService) UpdatePayoutStatus(ctx context.Context, pId string,status string)  error {
	return ps.paymentRepo.UpdatePayoutStatus(ctx, pId ,status )
}

func (r *PaymentService) HandlePayoutStatus(ctx context.Context,event stripe.Event) error {
	var payout stripe.Payout
	if err := json.Unmarshal(event.Data.Raw, &payout); err != nil {
		return err
	}

	internalID := payout.Metadata["payout_id"]

	switch event.Type {
	case "payout.paid":
		return r.UpdatePayoutStatus(ctx, internalID, "paid")
	case "payout.failed":
		return r.UpdatePayoutStatus(ctx, internalID, "failed")
	default:
		return nil
	}
}