package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
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
	existing, err := ps.paymentRepo.GetPaymentByOrderID(ctx, payload.PurchaseOrderID)
	if err != nil && err != pgx.ErrNoRows {
		return nil, fmt.Errorf("check existing payment: %w", err)
	}
    if existing != nil && existing.Status == "success" {
		return nil, echo.NewHTTPError(http.StatusConflict, "Payment already completed for this order")
	}
    
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
	if err := ps.paymentRepo.CreateOrderPayment(ctx, p); err != nil {
		return nil,fmt.Errorf("store payment info: %w", err)
	}


	return &khaltiResp, nil
}

func (ps *PaymentService) VerifyKhaltiPayment(c echo.Context, payload *payment.KhaltiVerifyPaymentPayload) error {
	ctx := c.Request().Context()
	pidx := payload.Pidx

	// 1️⃣ Verify payment with Khalti
	req, _ := http.NewRequest("POST", ps.server.Config.Khalti.VerifyURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"pidx":"%s"}`, pidx))))
	req.Header.Set("Authorization", "Key "+ps.server.Config.Khalti.SecretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("khalti verify error: %w", err)
	}
	defer resp.Body.Close()

	var verifyResp payment.KhaltiVerifyPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return fmt.Errorf("decode khalti verify: %w", err)
	}

	status := verifyResp.Status

	// 2️⃣ Update payment and order status
	if status == "Completed" {
		if orderID, err := ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, "success"); err == nil {
			if err := ps.orderRepo.MarkOrderPaid(ctx, orderID); err != nil {
				return fmt.Errorf("update order: %w", err)
			}
		}
		if (err != nil){
			return fmt.Errorf("update payment: %w", err)
		}
	} else {
		_ ,_= ps.paymentRepo.UpdatePaymentStatus(ctx, pidx, status)
	}

	return c.JSON(http.StatusOK, verifyResp)
}
