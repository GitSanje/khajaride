package service

import (
	"fmt"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model/order"
	"github.com/jackc/pgx/v5"

	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)

type OrderService struct {
	server    *server.Server
	orderRepo *repository.OrderRepository
	cartRepo  *repository.CartRepository
}

func NewOrderService(s *server.Server, orderRepo *repository.OrderRepository, cartRepo *repository.CartRepository) *OrderService {
	return &OrderService{
		server:    s,
		orderRepo: orderRepo,
		cartRepo:  cartRepo,
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

	// 2️⃣ Check if order_vendor already exists for this vendor_cart_id
	existingOrder, err := s.orderRepo.GetOrderVendorByCartID(ctxx, tx, cartVendor.ID)
	if err != nil && err != pgx.ErrNoRows {
		return "", fmt.Errorf("failed to check existing order_vendor: %w", err)
	}
	var oVendor *order.OrderVendor

	needsUpdate := false

	if existingOrder != nil {

		updateArgs := pgx.NamedArgs{
			"id": existingOrder.ID,
		}

		if *existingOrder.DeliveryAddressID != payload.DeliveryAddressId {
			updateArgs["delivery_address_id"] = payload.DeliveryAddressId
			needsUpdate = true
		}
		if existingOrder.Subtotal != cartVendor.Subtotal {
			updateArgs["subtotal"] = cartVendor.Subtotal
			needsUpdate = true
		}
		if *existingOrder.DeliveryInstructions != payload.DeliveryInstructions {
			updateArgs["delivery_instructions"] = payload.DeliveryInstructions
			needsUpdate = true
		}
		if cartVendor.DeliveryCharge != nil && existingOrder.DeliveryCharge != *cartVendor.DeliveryCharge {
			updateArgs["delivery_charge"] = cartVendor.DeliveryCharge
			needsUpdate = true
		}

		if needsUpdate {
			oVendor, err = s.orderRepo.UpdateOrderVendor(ctxx, tx, updateArgs)
			if err != nil {
				return "", err
			}
		} else {
			oVendor = existingOrder
			logger.Info().
				Str("event", "existed order").
				Str("order vendor", oVendor.ID).
				Msg("Order send successfully")
			return oVendor.ID, nil
		}
	} else {
		// 2️⃣ Create order vendor
		oVendor, err = s.orderRepo.CreateOrderVendor(ctxx, tx, userID, *cartVendor, payload)
		if err != nil {
			logger.Info().
				Str("event", "order_created").
				Str("order vendor", oVendor.ID).
				Msg("Order created successfully")
			return "", err
		}

	}

	// 3️⃣ Fetch cart items
	cartItems, err := s.cartRepo.ListCartItems(ctxx, tx, cartVendor.ID)
	if err != nil {
		return "", err
	}

	// 4️⃣ Create order items

	for _, ci := range cartItems {
		if needsUpdate {
			if err := s.orderRepo.UpdateOrderItem(ctxx, tx, oVendor.ID, ci); err != nil {
				return "", err
			}
		} else {
			if err := s.orderRepo.CreateOrderItem(ctxx, tx, oVendor.ID, ci); err != nil {
				return "", err
			}

		}

	}

	if err := tx.Commit(ctxx); err != nil {
		return "", err
	}

	return oVendor.ID, nil
}
