

package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)


func registerPaymentRoutes(r *echo.Group, h *handler.PaymentHandler, auth *middleware.AuthMiddleware) {

	// ------------------- Payment -------------------
	payment := r.Group("/payments")
	payment.GET("/khalti/callback", h.KhaltiCallback)
	payment.Use(auth.RequireAuth)
	payment.POST("/khalti/initiate", h.KhaltiPayment)
	payment.POST("/khalti/verify", h.VerifyKhaltiPayment)

}