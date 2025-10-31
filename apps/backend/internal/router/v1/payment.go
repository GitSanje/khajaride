

package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)


func registerPaymentRoutes(r *echo.Group, h *handler.PaymentHandler, auth *middleware.AuthMiddleware) {

	
	payment := r.Group("/payments")
    // ------------------- Khalti Payment -------------------
	payment.GET("/khalti/callback", h.KhaltiCallback)
	// ------------------- Stripe Payment -------------------
	//4000003560000008
	payment.GET("/stripe/verify", h.VerifyStripePayment)
    payment.GET("/stripe/cancel", h.StripeCancelPayment)
	payment.Use(auth.RequireAuth)
	payment.POST("/stripe/initiate", h.StripePayment)

	payment.POST("/khalti/initiate", h.KhaltiPayment)


}