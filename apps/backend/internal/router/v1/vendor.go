package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)



func registerVendorRoutes(r *echo.Group, h *handler.VendorHandler, auth *middleware.AuthMiddleware) {
	// Protect all /users routes with auth middleware
	vendor := r.Group("/vendors")
	vendor.POST("/bulk", h.CreateVendors)      

}
