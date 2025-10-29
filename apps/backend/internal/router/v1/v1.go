package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterV1Routes(router *echo.Group, handlers *handler.Handlers, middleware *middleware.Middlewares) {

	registerUserRoutes(router, handlers.User, middleware.Auth)
	registerVendorRoutes(router, handlers.Vendor, middleware.Auth)
	registerSearchRoutes(router, handlers.Search, middleware.Auth)
	registerCartRoutes(router, handlers.Cart, middleware.Auth)
	registerOrderRoutes(router, handlers.Order, middleware.Auth)
	registerPaymentRoutes(router, handlers.Payment, middleware.Auth)
}