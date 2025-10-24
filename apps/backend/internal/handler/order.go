package handler

import (
	"net/http"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model/order"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	Handler
	OrderService *service.OrderService

}


func NewOrderHandler(s *server.Server, os *service.OrderService) *OrderHandler {
	return &OrderHandler{
		Handler:     NewHandler(s),
		OrderService: os,
	}
}



// =========================================================
// CREATE ORDER FROM CART HANDLERS
// =========================================================


type CreateOrderFromCartPayload struct{
	UserID  *string `json:"userId"`
}

func (p *CreateOrderFromCartPayload) Validate() error {
	return nil
}

func (h *OrderHandler) CreateOrderFromCart(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *CreateOrderFromCartPayload) (*order.OrderGroup, error) {
			var userID string
			if uId := payload.UserID; uId != nil {
				userID = *uId
			} else {
				userID = middleware.GetUserID(c)
			}
			return h.OrderService.CreateOrderFromCart(c, userID)
		},
		http.StatusCreated,
		&CreateOrderFromCartPayload{},
	)(c)
}
