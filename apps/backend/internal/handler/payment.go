package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/model/payout"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/account"
	"github.com/stripe/stripe-go/v83/charge"
	"github.com/stripe/stripe-go/v83/checkout/session"
	"github.com/stripe/stripe-go/v83/webhook"
)

type PaymentHandler struct {
	Handler
	PaymentService *service.PaymentService
	userRepo       *repository.UserRepository
}

func NewPaymentHandler(s *server.Server, ps *service.PaymentService, userRepo *repository.UserRepository) *PaymentHandler {
	return &PaymentHandler{
		Handler:        NewHandler(s),
		PaymentService: ps,
		userRepo:       userRepo,
	}
}

func (h *PaymentHandler) KhaltiPayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.KhaltiPaymentPayload) (*payment.KhaltiPaymentResponse, error) {

			return h.PaymentService.ProcessKhaltiPayment(c, payload)
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

			return h.PaymentService.ProcessStripeCheckout(c, payload)
		},
		http.StatusCreated,
		&payment.StripePaymentPayload{},
	)(c)

}

func (h *PaymentHandler) VerifyStripePayment(c echo.Context) error {

	payload := &payment.StripeVerifyPayload{
		SessionID:         c.QueryParam("session_id"),
		PurchaseOrderID:   c.QueryParam("purchase_order_id"),
		PurchaseOrderName: c.QueryParam("purchase_order_name"),
		Amount:            parseFloat(c.QueryParam("amount")),
	}
	sess, err := session.Get(payload.SessionID, nil)
	if err != nil {
		return fmt.Errorf("fetch stripe session: %w", err)
	}
	status := string(sess.PaymentStatus)

	// orderID, status, err := h.PaymentService.VerifyAndUpdateStripePayment(ctx, payload)
	// if err != nil {
	// 	return c.JSON(http.StatusInternalServerError, map[string]string{
	// 		"error": fmt.Sprintf("Failed to verify payment: %v", err),
	// 	})
	// }

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
		url.QueryEscape(payload.PurchaseOrderID),
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

			return h.PaymentService.CreateOnboardingAccountWithLink(c, payload)
		},
		http.StatusCreated,
		&payment.OnboardingPayload{},
	)(c)

}

func (h *PaymentHandler) CreateOnboardingAccountLink(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.OnboardingAccountLinkPayload) (*payment.OnboardingResponse, error) {
			userVendorID := middleware.GetUserID(c)
			url, err := h.PaymentService.CreateOnboardingLink(c.Request().Context(), payload.AccountId, userVendorID)
			if err != nil {
				return nil, fmt.Errorf("err creating link%v", err)
			}
			return &payment.OnboardingResponse{
				URL: &url,
			}, nil
		},
		http.StatusCreated,
		&payment.OnboardingAccountLinkPayload{},
	)(c)

}

func (h *PaymentHandler) StripeOnboardingRefresh(c echo.Context) error {

	accountID := c.QueryParam("account_id")
	userVendorID := c.QueryParam("vendor_user_id")
	if accountID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing account_id",
		})
	}

	url, err := h.PaymentService.CreateOnboardingLink(c.Request().Context(), accountID, userVendorID)
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
	userVendorID := c.QueryParam("vendor_user_id")
	if accountID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing account_id",
		})
	}
	frontendUrl := "http://localhost:4000"

	// Fetch the connected account from Stripe
	acct, err := account.GetByID(accountID, &stripe.AccountParams{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to fetch Stripe account: %v", err),
		})
	}

	// Check if there are still required items
	if len(acct.Requirements.CurrentlyDue) > 0 || len(acct.Requirements.EventuallyDue) > 0 {
		// Not finished → redirect to onboarding incomplete page
		url := fmt.Sprintf(`%s/vendor-onboarding/payout?account_id=%s,status=%s`, frontendUrl, accountID, "incomplete")
		return c.Redirect(http.StatusSeeOther, url)
	}

	trackPayload := &user.VendorOnboardingTrackPayload{
		Completed:   true,
		CurrentStep: "completed",
	}

	if _, err := h.userRepo.VendorOnboardingTrack(c.Request().Context(), userVendorID, trackPayload); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to upadte  VendorOnboardingTrack: %v", err),
		})
	}

	if err := h.PaymentService.UpdateStripePayoutAccount(c.Request().Context(), userVendorID, acct); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to update payout account: %v", err),
		})
	}
	url := fmt.Sprintf(`%s/vendor-onboarding/payout?account_id=%s&status=%s`, frontendUrl, accountID, "verified")
	// ✅ Onboarding completed → redirect to verified page
	return c.Redirect(http.StatusSeeOther, url)
}

func (ph *PaymentHandler) HandleStripeWebhook(c echo.Context) error {
	ctx := c.Request().Context()

	payload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.String(http.StatusBadRequest, "Failed to read body")
	}
	sigHeader := c.Request().Header.Get("Stripe-Signature")
	endpointSecret := ph.server.Config.Stripe.WebhookSecret
	// Verify request came from Stripe
	event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
	if err != nil {
		fmt.Println("⚠️  Webhook signature verification failed:", err)
		return c.String(http.StatusBadRequest, "Invalid signature")
	}
	switch event.Type {

	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			return c.String(http.StatusBadRequest, "Failed to parse session")
		}
		orderID := session.Metadata["purchase_order_id"]

		// 🚀 Call your Verify & Update function
		orderID, status, err := ph.PaymentService.VerifyAndUpdateStripePayment(ctx, &payment.StripeVerifyPayload{
			SessionID: session.ID,
		})

		if err != nil {
			fmt.Println("❌ Failed updating payment:", err)
			return c.String(http.StatusInternalServerError, "Failed to update payment")
		}

		fmt.Println("✅ Payment processed:", orderID, status)
		// Return 200 so Stripe stops retrying
		return c.JSON(http.StatusOK, map[string]string{
			"Messages": "successfully processed",
		})

	case "application_fee.created":
		var fee stripe.ApplicationFee
		if err := json.Unmarshal(event.Data.Raw, &fee); err != nil {
			return c.String(http.StatusBadRequest, "Invalid application_fee payload")
		}

		stripe.Key = ph.server.Config.Stripe.SecretKey

		// // Handle connected vs platform account safely
		var stripeAccountID *string
		if fee.Account != nil {
			stripeAccountID = stripe.String(fee.Account.ID)
		}
		params := &stripe.ChargeParams{} 
		params.StripeAccount = stripeAccountID


		// Fetch charge
		ch, err := charge.Get(fee.OriginatingTransaction.ID,nil)
		if err != nil {
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Failed to fetch charge: %v", err))
		}


		orderID := ch.Metadata["purchase_order_id"]
		vendorUserId := ch.Metadata["vendor_user_id"]

		payoutAccId, err := ph.PaymentService.GetPayoutAccountID(ctx, vendorUserId)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Failed to get payout account")
		}

		commission := float64(fee.Amount) / 100

		_, err = ph.PaymentService.CreatePayout(ctx, &payout.Payout{
			VendorUserID:   &vendorUserId,
			Sender:         "platform",
			OrderID:        stripe.String(orderID),
			PayoutType:     "commission",
			AccountID:      stripe.String(payoutAccId),
			Method:         "stripe",
			Amount:         commission,
			TransactionRef: stripe.String(fee.ID),
			Status:         "completed",
		})
		if err != nil {
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Failed to create payout entry: %v", err))
		}

		return c.NoContent(http.StatusOK)

	case "payout.paid":
		if err := ph.PaymentService.HandlePayoutStatus(ctx, event); err != nil {
			return c.String(http.StatusInternalServerError, "Failed to update payout status")
		}
		return c.NoContent(http.StatusOK)
	case "payout.failed":
		if err := ph.PaymentService.HandlePayoutStatus(ctx, event); err != nil {
			return c.String(http.StatusInternalServerError, "Failed to update payout status")
		}
		return c.NoContent(http.StatusOK)

	default:
		// Ignore other events
		return c.NoContent(http.StatusOK)
	}

}

// Helper: safely parse string → float
func parseFloat(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f

}
