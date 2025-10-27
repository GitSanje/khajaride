package service

import (
	"database/sql"
	"errors"

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

func (s *OrderService) CreateOrderFromCart(ctx echo.Context, userID string) (*order.OrderGroup, error) {
	logger := middleware.GetLogger(ctx)
    ctxx := ctx.Request().Context()

	// Begin Transaction
    tx, err := s.server.DB.Pool.Begin(ctxx)
    if err != nil {
        return nil, err
    }
    defer tx.Rollback(ctxx)

	// 1️⃣ Fetch active cart session
    session, err := s.cartRepo.GetActiveCartSession(ctxx, tx, userID)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, echo.NewHTTPError(400, "No active cart found")
        }
        return nil, err
    }
    // 2️⃣ Fetch all vendor carts under this session
    vendorCarts, err := s.cartRepo.ListCartVendors(ctxx, tx, session.ID)
    if err != nil {
        return nil, err
    }

	 if len(vendorCarts) == 0 {
        return nil, echo.NewHTTPError(400, "No items found in cart")
    }

	// 3️⃣ Create order group
    orderGroup, err := s.orderRepo.CreateOrderGroup(ctxx, tx, userID)
    if err != nil {
        return nil, err
    }

	 // 4️⃣ Loop through vendor carts

	  for _, vCart := range vendorCarts {
              // Create order_vendor
        oVendor, err := s.orderRepo.CreateOrderVendor(ctxx, tx, userID, orderGroup.ID, vCart)
        if err != nil {
            return nil, err
        }
		// Copy cart_items → order_items
        items, err := s.cartRepo.ListCartItems(ctxx, tx, vCart.ID)
        if err != nil {
            return nil, err
        }

		for _, ci := range items {
            if err := s.orderRepo.CreateOrderItem(ctxx, tx, oVendor.ID, ci); err != nil {
                return nil, err
            }
        }


	  }

	if err := s.cartRepo.MarkCartSessionCheckedOut(ctxx, tx, session.ID); err != nil {
    return nil, err
}

	  // 5️⃣ Commit Transaction
    if err := tx.Commit(ctxx); err != nil {
        return nil, err
    }


	    logger.Info().
        Str("event", "order_created").
        Str("order_group_id", orderGroup.ID).
        Msg("Order created successfully")

    return orderGroup, nil



}