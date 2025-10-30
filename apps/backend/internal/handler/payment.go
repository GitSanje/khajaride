package handler

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	Handler
	PaymentService *service.PaymentService

}


func NewPaymentHandler(s *server.Server, ps *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		Handler:       NewHandler(s),
		PaymentService: ps,
	}
}

func (h *PaymentHandler) KhaltiPayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.KhaltiPaymentPayload) (*payment.KhaltiPaymentResponse, error) {
		
			return  h.PaymentService.ProcessKhaltiPayment(c, payload)
		},
		http.StatusCreated,
		&payment.KhaltiPaymentPayload{},
	)(c)

}

func (h *PaymentHandler) VerifyKhaltiPayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.KhaltiVerifyPaymentPayload) (*payment.KhaltiVerifyPaymentResponse, error) {

			return h.PaymentService.VerifyKhaltiPayment(c, payload)
		},
		http.StatusOK,
		&payment.KhaltiVerifyPaymentPayload{},
	)(c)
}
func (h *PaymentHandler) KhaltiCallback(c echo.Context) error {
	ctx := c.Request().Context()

	// 1️⃣ Extract query params from callback URL
	payload := &payment.KhaltiCallbackPayload{
		Pidx:              c.QueryParam("pidx"),
		TxnID:             c.QueryParam("txnId"),
		Amount:            parseFloat(c.QueryParam("amount")),
		TotalAmount:       parseFloat(c.QueryParam("total_amount")),
		Status:            c.QueryParam("status"),
		Mobile:            c.QueryParam("mobile"),
		Tidx:              c.QueryParam("tidx"),
		PurchaseOrderID:   c.QueryParam("purchase_order_id"),
		PurchaseOrderName: c.QueryParam("purchase_order_name"),
		TransactionID:     c.QueryParam("transaction_id"),
	}



	// 2️⃣ Call service layer
	orderID, status, err := h.PaymentService.VerifyAndUpdateKhaltiPayment(ctx, payload)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to verify payment: %v", err),
		})
	}

	// 3️⃣ Build redirect URL for frontend
	redirectURL := fmt.Sprintf(
		"%s/payment/status?pidx=%s&status=%s&txnId=%s&amount=%f&total_amount=%f&mobile=%s&tidx=%s&purchase_order_id=%s&purchase_order_name=%s&transaction_id=%s&order_id=%s",
		h.server.Config.Khalti.FrontEndURL,
		url.QueryEscape(payload.Pidx),
		url.QueryEscape(status),
		url.QueryEscape(payload.TxnID),
		payload.Amount,
		payload.TotalAmount,
		url.QueryEscape(payload.Mobile),
		url.QueryEscape(payload.Tidx),
		url.QueryEscape(payload.PurchaseOrderID),
		url.QueryEscape(payload.PurchaseOrderName),
		url.QueryEscape(payload.TransactionID),
		url.QueryEscape(orderID),
	)

	// 4️⃣ Redirect to frontend
	return c.Redirect(http.StatusFound, redirectURL)
}

// Helper: safely parse string → float
func parseFloat(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}
