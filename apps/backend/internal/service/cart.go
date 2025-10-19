package service

import (
	"database/sql"
	"errors"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/cart"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)

type CartService struct {
	server   *server.Server
	cartRepo *repository.CartRepository
}

func NewCartService(s *server.Server, cartRepo *repository.CartRepository) *CartService {
	return &CartService{
		server:   s,
		cartRepo: cartRepo,
	}
}

// ==================================================
// ADD CART ITEM
// ==================================================
func (s *CartService) AddCartItem(ctx echo.Context, userID string, payload *cart.AddCartItemPayload) (*cart.CartItem, error) {
	logger := middleware.GetLogger(ctx)

	tx, err := s.server.DB.Pool.Begin(ctx.Request().Context())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx.Request().Context())

	// 1️⃣ Ensure active cart session exists
	session, err := s.cartRepo.GetActiveCartSession(ctx.Request().Context(), tx, userID)
	if errors.Is(err, sql.ErrNoRows) {
		session, err = s.cartRepo.CreateActiveCartSession(ctx.Request().Context(), tx, userID)
		if err != nil {
			return nil, err
		}
	}

	// 2️⃣ Ensure cart_vendor exists for that vendor
	cart_vendor, err := s.cartRepo.GetCartVendor(ctx.Request().Context(), tx, session.ID, payload.VendorID)
	if errors.Is(err, sql.ErrNoRows) {
		cart_vendor, err = s.cartRepo.CreateActiveCartVendor(ctx.Request().Context(), tx, session.ID, payload.VendorID)
		if err != nil {
			return nil, err
		}
	}
	// 3️⃣ Add or update cart item
	item, err := s.cartRepo.UpsertCartItem(ctx.Request().Context(), tx, cart_vendor.ID, payload)
	if err != nil {
		return nil, err
	}

	// 4️⃣ Recalculate subtotal for that vendor
	if err := s.cartRepo.UpdateCartVendorSubtotal(ctx.Request().Context(), tx, cart_vendor.ID); err != nil {
		return nil, err
	}

	// Commit transaction
	if err := tx.Commit(ctx.Request().Context()); err != nil {
		return nil, err
	}

	logger.Info().
		Str("event", "cart_item_created").
		Str("cart_item_id", item.ID).
		Str("menu_item_id", item.MenuItemID).
		Int("quantity", item.Quantity).
		Msg("Cart item created successfully")

	return item, nil
}

// ==================================================
// GET ACTIVE CARTS BY USER ID
// ==================================================

func (s *CartService) GetActiveCartsByUserID(ctx echo.Context, userID string) ([]cart.CartItemPopulated, error) {

	logger := middleware.GetLogger(ctx)

	cartItems, err := s.cartRepo.GetActiveCartsByUserID(ctx.Request().Context(), userID)
	if err != nil {
		logger.Error().
			Err(err).
			Str("user_id", userID).
			Msg("Failed to fetch cart items")
		return nil, err
	}

	return cartItems, nil

}

// ==================================================
// CREATE CART SESSION
// ==================================================
func (s *CartService) CreateCartSession(ctx echo.Context, payload *cart.CreateCartSessionPayload) (*cart.CartSession, error) {
	logger := middleware.GetLogger(ctx)

	created, err := s.cartRepo.CreateCartSession(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("user_id", payload.UserID).
			Msg("Failed to create cart session")
		return nil, err
	}

	logger.Info().
		Str("event", "cart_session_created").
		Str("cart_session_id", created.ID).
		Str("user_id", created.UserID).
		Msg("Cart session created successfully")

	return created, nil
}

// ==================================================
// UPDATE CART SESSION
// ==================================================
func (s *CartService) UpdateCartSession(ctx echo.Context, payload *cart.UpdateCartSessionPayload) (*cart.CartSession, error) {
	logger := middleware.GetLogger(ctx)

	updated, err := s.cartRepo.UpdateCartSession(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_session_id", payload.ID).
			Msg("Failed to update cart session")
		return nil, err
	}

	logger.Info().
		Str("cart_session_id", updated.ID).
		Str("status", updated.Status).
		Msg("Cart session updated successfully")

	return updated, nil
}

// ==================================================
// GET CART SESSIONS
// ==================================================
func (s *CartService) GetCartSessions(ctx echo.Context, query *cart.GetCartSessionsQuery) (*model.PaginatedResponse[cart.CartSession], error) {
	logger := middleware.GetLogger(ctx)

	result, err := s.cartRepo.GetCartSessions(ctx.Request().Context(), query)
	if err != nil {
		logger.Error().
			Err(err).
			Msg("Failed to fetch cart sessions")
		return nil, err
	}

	logger.Info().
		Int("count", len(result.Data)).
		Int("page", result.Page).
		Int("total", result.Total).
		Msg("Cart sessions fetched successfully")

	return result, nil
}

// ==================================================
// DELETE CART SESSION
// ==================================================
func (s *CartService) DeleteCartSession(ctx echo.Context, payload *cart.DeleteCartSessionPayload) error {
	logger := middleware.GetLogger(ctx)

	err := s.cartRepo.DeleteCartSession(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_session_id", payload.ID).
			Msg("Failed to delete cart session")
		return err
	}

	logger.Info().
		Str("cart_session_id", payload.ID).
		Msg("Cart session deleted successfully")

	return nil
}

// ==================================================
// CREATE CART VENDOR
// ==================================================
func (s *CartService) CreateCartVendor(ctx echo.Context, payload *cart.CreateCartVendorPayload) (*cart.CartVendor, error) {
	logger := middleware.GetLogger(ctx)

	created, err := s.cartRepo.CreateCartVendor(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_session_id", payload.CartSessionID).
			Str("vendor_id", payload.VendorID).
			Msg("Failed to create cart vendor")
		return nil, err
	}

	logger.Info().
		Str("event", "cart_vendor_created").
		Str("cart_vendor_id", created.ID).
		Str("vendor_id", created.VendorID).
		Msg("Cart vendor created successfully")

	return created, nil
}

// ==================================================
// UPDATE CART VENDOR
// ==================================================
func (s *CartService) UpdateCartVendor(ctx echo.Context, payload *cart.UpdateCartVendorPayload) (*cart.CartVendor, error) {
	logger := middleware.GetLogger(ctx)

	updated, err := s.cartRepo.UpdateCartVendor(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_vendor_id", payload.ID).
			Msg("Failed to update cart vendor")
		return nil, err
	}

	logger.Info().
		Str("cart_vendor_id", updated.ID).
		Msg("Cart vendor updated successfully")

	return updated, nil
}

// ==================================================
// GET CART VENDORS
// ==================================================
func (s *CartService) GetCartVendors(ctx echo.Context, query *cart.GetCartVendorsQuery) (*model.PaginatedResponse[cart.CartVendor], error) {
	logger := middleware.GetLogger(ctx)

	result, err := s.cartRepo.GetCartVendors(ctx.Request().Context(), query)
	if err != nil {
		logger.Error().
			Err(err).
			Msg("Failed to fetch cart vendors")
		return nil, err
	}

	logger.Info().
		Int("count", len(result.Data)).
		Int("page", result.Page).
		Int("total", result.Total).
		Msg("Cart vendors fetched successfully")

	return result, nil
}

// ==================================================
// DELETE CART VENDOR
// ==================================================
func (s *CartService) DeleteCartVendor(ctx echo.Context, payload *cart.DeleteCartVendorPayload) error {
	logger := middleware.GetLogger(ctx)

	logger.Info().
		Str("cart_vendor_id", payload.ID).
		Msg("Deleting cart vendor")

	err := s.cartRepo.DeleteCartVendor(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_vendor_id", payload.ID).
			Msg("Failed to delete cart vendor")
		return err
	}

	logger.Info().
		Str("cart_vendor_id", payload.ID).
		Msg("Cart vendor deleted successfully")

	return nil
}

// ==================================================
// CREATE CART ITEM
// ==================================================
func (s *CartService) CreateCartItem(ctx echo.Context, payload *cart.CreateCartItemPayload) (*cart.CartItem, error) {
	logger := middleware.GetLogger(ctx)

	logger.Info().
		Str("cart_vendor_id", payload.CartVendorID).
		Str("menu_item_id", payload.MenuItemID).
		Int("quantity", payload.Quantity).
		Msg("Starting cart item creation")

	created, err := s.cartRepo.CreateCartItem(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_vendor_id", payload.CartVendorID).
			Str("menu_item_id", payload.MenuItemID).
			Msg("Failed to create cart item")
		return nil, err
	}

	logger.Info().
		Str("event", "cart_item_created").
		Str("cart_item_id", created.ID).
		Str("menu_item_id", created.MenuItemID).
		Int("quantity", created.Quantity).
		Msg("Cart item created successfully")

	return created, nil
}

// ==================================================
// ADJUST CART ITEM QUANTITY
// ==================================================

func (s *CartService) AdjustCartItemQuantity(ctx echo.Context, payload *cart.AdjustCartItemQuantityPayload) (*cart.CartItem, error) {
	tx, err := s.server.DB.Pool.Begin(ctx.Request().Context())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx.Request().Context())

	item, err := s.cartRepo.AdjustCartItemQuantity(ctx.Request().Context(), tx, payload)
	if err != nil {
		return nil, err
	}
	if err := s.cartRepo.UpdateCartVendorSubtotal(ctx.Request().Context(), tx, item.CartVendorID); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx.Request().Context()); err != nil {
		return nil, err
	}
	return item,nil
}

func (s *CartService) UpdateCartItem(ctx echo.Context, payload *cart.UpdateCartItemPayload) (*cart.CartItem, error) {
	logger := middleware.GetLogger(ctx)

	updated, err := s.cartRepo.UpdateCartItem(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().
			Err(err).
			Str("cart_item_id", payload.ID).
			Msg("Failed to update cart item")
		return nil, err
	}

	logger.Info().
		Str("cart_item_id", updated.ID).
		Msg("Cart item updated successfully")

	return updated, nil
}

// ==================================================
// GET CART ITEMS
// ==================================================
func (s *CartService) GetCartItems(ctx echo.Context, query *cart.GetCartItemsQuery) (*model.PaginatedResponse[cart.CartItem], error) {
	logger := middleware.GetLogger(ctx)

	result, err := s.cartRepo.GetCartItems(ctx.Request().Context(), query)
	if err != nil {
		logger.Error().
			Err(err).
			Msg("Failed to fetch cart items")
		return nil, err
	}

	logger.Info().
		Int("count", len(result.Data)).
		Int("page", result.Page).
		Int("total", result.Total).
		Msg("Cart items fetched successfully")

	return result, nil
}

// ==================================================
// DELETE CART ITEM
// ==================================================
func (s *CartService) DeleteCartItem(ctx echo.Context, payload *cart.DeleteCartItemPayload) error {
	reqCtx := ctx.Request().Context()

	tx, err := s.server.DB.Pool.Begin(reqCtx)
	if err != nil {
		return err
	}
	defer tx.Rollback(reqCtx)

	
	item, err := s.cartRepo.DeleteCartItem(reqCtx, tx, payload)
	if err != nil {
		return err
	}

	// Nothing deleted, exit silently
	if item == nil {
		return echo.NewHTTPError(404, "Item not found")
	}

	// Update vendor subtotal
	if err := s.cartRepo.UpdateCartVendorSubtotal(reqCtx, tx, item.CartVendorID); err != nil {
		return err
	}

	
	if err := tx.Commit(reqCtx); err != nil {
		return err
	}

	return nil
}