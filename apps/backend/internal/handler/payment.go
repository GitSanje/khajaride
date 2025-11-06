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
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/account"
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


func (h *PaymentHandler) StripePayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.StripePaymentPayload) (*payment.StripePaymentResponse, error) {
		
			return  h.PaymentService.ProcessStripeCheckout(c, payload)
		},
		http.StatusCreated,
		&payment.StripePaymentPayload{},
	)(c)

}


func (h *PaymentHandler) VerifyStripePayment(c echo.Context) error {
	ctx := c.Request().Context()

	payload := &payment.StripeVerifyPayload{
		SessionID:  c.QueryParam("session_id"),
		PurchaseOrderID:   c.QueryParam("purchase_order_id"),
		PurchaseOrderName: c.QueryParam("purchase_order_name"),
		Amount:            parseFloat(c.QueryParam("amount")),
		
	}

	orderID, status, err := h.PaymentService.VerifyAndUpdateStripePayment(ctx, payload)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to verify payment: %v", err),
		})
	}

	redirectURL := fmt.Sprintf(
		"%s/payment/status?pidx=%s&status=%s&txnId=%s&amount=%f&total_amount=%f&mobile=%s&tidx=%s&purchase_order_id=%s&purchase_order_name=%s&transaction_id=%s&order_id=%s",
		h.server.Config.Khalti.FrontEndURL,
		url.QueryEscape(payload.SessionID),
		url.QueryEscape(status),
		url.QueryEscape(payload.SessionID),
		payload.Amount,
		payload.Amount,
		"",
		url.QueryEscape(payload.SessionID),
		url.QueryEscape(payload.PurchaseOrderID),
		url.QueryEscape(payload.PurchaseOrderName),
		url.QueryEscape(payload.SessionID),
		url.QueryEscape(orderID),
	)
   return c.Redirect(http.StatusFound, redirectURL)

}


func (h *PaymentHandler) StripeCancelPayment(c echo.Context) error {
	return h.PaymentService.StripeCancelPayment(c) 

}

func (h *PaymentHandler) OnboardingStripeConnectAccount(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.OnboardingPayload) (*payment.OnboardingResponse, error) {
		
			return  h.PaymentService.CreateOnboardingAccountWithLink(c, payload)
		},
		http.StatusCreated,
		&payment.OnboardingPayload{},
	)(c)

}

func (h *PaymentHandler) CreateOnboardingAccountLink(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.OnboardingAccountLinkPayload) (*payment.OnboardingResponse, error) {
		    url, err := h.PaymentService.CreateOnboardingLink(c.Request().Context(), payload.AccountId)
			if( err != nil){
				return  nil,fmt.Errorf("err creating link%v",err)
			}
			return &payment.OnboardingResponse{
				URL: url,
			},nil
		},
		http.StatusCreated,
		&payment.OnboardingAccountLinkPayload{},
	)(c)

}

func (h *PaymentHandler) StripeOnboardingRefresh(c echo.Context)  error{
	
	accountID := c.QueryParam("account_id")
	if accountID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing account_id",
		})
	}

	url, err := h.PaymentService.CreateOnboardingLink(c.Request().Context(), accountID)
	if err != nil {
		 c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to create refresh link: %v", err),
		})
	}
     
	return c.Redirect(http.StatusSeeOther, url)
}

func (h *PaymentHandler) StripeOnboardingReturn(c echo.Context) error {
    stripe.Key = h.server.Config.Stripe.SecretKey
	accountID := c.QueryParam("account_id")
	if accountID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing account_id",
		})
	}

	// Fetch the connected account from Stripe
	acct, err := account.Get()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to fetch Stripe account: %v", err),
		})
	}

	// Check if there are still required items
	if len(acct.Requirements.CurrentlyDue) > 0 || len(acct.Requirements.EventuallyDue) > 0 {
		// Not finished → redirect to onboarding incomplete page
	    url:=fmt.Sprintf(`/vendor-onboarding/payment/onboarding-incomplete?account_id=%s`, accountID)
		return c.Redirect(http.StatusSeeOther, url)
	}

	// ✅ Onboarding completed → redirect to verified page
	return c.Redirect(http.StatusSeeOther, "/vendor-onboarding/payment/verified")
}



// Helper: safely parse string → float
func parseFloat(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}


