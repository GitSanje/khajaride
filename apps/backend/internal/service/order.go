package service

import (

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model/order"

	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)

type OrderService struct {
	server   *server.Server
	orderRepo *repository.OrderRepository
	cartRepo  *repository.CartRepository
}

func NewOrderService(s *server.Server, orderRepo *repository.OrderRepository, cartRepo *repository.CartRepository) *OrderService {
	return &OrderService{
		server:   s,
		orderRepo: orderRepo,
		cartRepo: cartRepo,
	}
}


func (s *OrderService) CreateOrder(ctx echo.Context, userID string, payload *order.CreateOrderPayload) (string, error) {

    logger := middleware.GetLogger(ctx)
    ctxx := ctx.Request().Context()

    // Begin Transaction
    tx, err := s.server.DB.Pool.Begin(ctxx)
    if err != nil {
        return "", err
    }
    defer tx.Rollback(ctxx)

    // 1️⃣ Fetch cart vendor
    cartVendor, err := s.cartRepo.GetCartVendorByID(ctxx, tx, payload.CartVendorId)
    if err != nil {
        return "", err
    }

    // 2️⃣ Create order vendor
     oVendor, err := s.orderRepo.CreateOrderVendor(ctxx, tx, userID,  *cartVendor,payload)
    if err != nil {
        return "", err
    }
    

    // 3️⃣ Fetch cart items
    cartItems, err := s.cartRepo.ListCartItems(ctxx, tx, cartVendor.ID)
    if err != nil {
        return "",err
    }

    // 4️⃣ Create order items


    for _, ci := range cartItems{
        if err := s.orderRepo.CreateOrderItem(ctxx, tx, oVendor.ID, ci); err != nil {
            return "", err
        }
    }


    if err := tx.Commit(ctxx); err != nil {
        return "", err
    }

      logger.Info().
        Str("event", "order_created").
        Str("order vendor", oVendor.ID).
        Msg("Order created successfully")
    return  oVendor.ID, nil
}