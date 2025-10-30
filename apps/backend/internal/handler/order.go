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




func (h *OrderHandler) CreateOrderFromCart(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *order.CreateOrderPayload) (interface{}, error) {
			var userID string
			if uId := payload.UserID; uId != nil {
				userID = *uId
			} else {
				userID = middleware.GetUserID(c)
			}
			orderID, err := h.OrderService.CreateOrder(c, userID, payload)
			if err != nil {
				return nil, err
			}
			return map[string]string{
				"message": "Order created Successfully",
				"orderId": orderID,
			}, nil
		},
		http.StatusCreated,
		&order.CreateOrderPayload{},
	)(c)
}




// =========================================================
// GET ORDERS BY USER ID
// =========================================================


type GetOrdersByUserIDPayload struct{
	
}

func (p *GetOrdersByUserIDPayload) Validate() error {
	return nil
}

func (h *OrderHandler) GetOrdersByUserId(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, _ *GetOrdersByUserIDPayload) (*[]order.PopulatedUserOrder, error) {
			
			userID := middleware.GetUserID(c)
			return h.OrderService.GetOrdersByUserId(c, userID)
		},
		http.StatusOK,
		&GetOrdersByUserIDPayload{},
	)(c)
}




// =========================================================
// GET ORDER BY ID
// =========================================================


func (h *OrderHandler) GetOrderById(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *order.GetOrderByIDPayload) (*order.PopulatedUserOrder, error) {
			return h.OrderService.GetOrderByID(c, payload)
		},
		http.StatusOK,
		&order.GetOrderByIDPayload{},
	)(c)
}