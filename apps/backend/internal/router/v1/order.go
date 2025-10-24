package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)



func registerOrderRoutes(r *echo.Group, h *handler.OrderHandler, auth *middleware.AuthMiddleware) {

	// ------------------- Order -------------------
	order := r.Group("/orders")
	//user_339ifDlrV566pSOsjbtBsQtAAar
	order.POST("/create-from-cart", h.CreateOrderFromCart)
}
