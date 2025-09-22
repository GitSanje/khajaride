package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterV1Routes(router *echo.Group, handlers *handler.Handlers, middleware *middleware.Middlewares) {

	registerUserRoutes(router, handlers.User, middleware.Auth)
}