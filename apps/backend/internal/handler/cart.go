package handler

import (

	"log"
	"net/http"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/cart"
	"github.com/gitSanje/khajaride/internal/model/coupon"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)

type CartHandler struct {
	Handler
	CartService *service.CartService

}


func NewCartHandler(s *server.Server, cs *service.CartService) *CartHandler {
	return &CartHandler{
		Handler:     NewHandler(s),
		CartService: cs,
	}
}



// =========================================================
// ADD CART ITEM HANDLERS
// =========================================================


func (h *CartHandler) AddCartItem(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.AddCartItemPayload) (*cart.CartItem, error) {
			userID := middleware.GetUserID(c)
           log.Println("userId",userID)
			return h.CartService.AddCartItem(c,userID, payload)
		},
		http.StatusCreated,
		&cart.AddCartItemPayload{},
	)(c)
}


// =========================================================
// GET CART ITEMS BY USER ID
// =========================================================


func (h *CartHandler) GetActiveCartsByUserID(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, _ *cart.GetCartItemsByUserId) ([]cart.CartItemPopulated, error) {
			userID := middleware.GetUserID(c)
			return h.CartService.GetActiveCartsByUserID(c,userID)
		},
		http.StatusOK,
		&cart.GetCartItemsByUserId{},
	)(c)
}



// =========================================================
// CART SESSION HANDLERS
// =========================================================

func (h *CartHandler) CreateCartSession(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.CreateCartSessionPayload) (*cart.CartSession, error) {
			return h.CartService.CreateCartSession(c, payload)
		},
		http.StatusCreated,
		&cart.CreateCartSessionPayload{},
	)(c)
}

func (h *CartHandler) UpdateCartSession(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.UpdateCartSessionPayload) (*cart.CartSession, error) {
			return h.CartService.UpdateCartSession(c, payload)
		},
		http.StatusOK,
		&cart.UpdateCartSessionPayload{},
	)(c)
}

func (h *CartHandler) GetCartSessions(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, query *cart.GetCartSessionsQuery) (*model.PaginatedResponse[cart.CartSession], error) {
			return h.CartService.GetCartSessions(c, query)
		},
		http.StatusOK,
		&cart.GetCartSessionsQuery{},
	)(c)
}

func (h *CartHandler) DeleteCartSession(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.DeleteCartSessionPayload) (interface{}, error) {
			return nil, h.CartService.DeleteCartSession(c, payload)
		},
		http.StatusNoContent,
		&cart.DeleteCartSessionPayload{},
	)(c)
}

// =========================================================
// CART VENDOR HANDLERS
// =========================================================

func (h *CartHandler) CreateCartVendor(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.CreateCartVendorPayload) (*cart.CartVendor, error) {
			return h.CartService.CreateCartVendor(c, payload)
		},
		http.StatusCreated,
		&cart.CreateCartVendorPayload{},
	)(c)
}

func (h *CartHandler) UpdateCartVendor(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.UpdateCartVendorPayload) (*cart.CartVendor, error) {
			return h.CartService.UpdateCartVendor(c, payload)
		},
		http.StatusOK,
		&cart.UpdateCartVendorPayload{},
	)(c)
}

func (h *CartHandler) GetCartVendors(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, query *cart.GetCartVendorsQuery) (*model.PaginatedResponse[cart.CartVendor], error) {
			return h.CartService.GetCartVendors(c, query)
		},
		http.StatusOK,
		&cart.GetCartVendorsQuery{},
	)(c)
}

func (h *CartHandler) DeleteCartVendor(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.DeleteCartVendorPayload) (interface{}, error) {
			return nil, h.CartService.DeleteCartVendor(c, payload)
		},
		http.StatusNoContent,
		&cart.DeleteCartVendorPayload{},
	)(c)
}

// =========================================================
// CART ITEM HANDLERS
// =========================================================

func (h *CartHandler) CreateCartItem(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.CreateCartItemPayload) (*cart.CartItem, error) {
			return h.CartService.CreateCartItem(c, payload)
		},
		http.StatusCreated,
		&cart.CreateCartItemPayload{},
	)(c)
}


func (h *CartHandler) AdjustCartItemQuantity(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.AdjustCartItemQuantityPayload) (*cart.CartItem, error) {
			return h.CartService.AdjustCartItemQuantity(c, payload)
		},
		http.StatusOK,
		&cart.AdjustCartItemQuantityPayload{},
	)(c)
}

func (h *CartHandler) UpdateCartItem(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.UpdateCartItemPayload) (*cart.CartItem, error) {
			return h.CartService.UpdateCartItem(c, payload)
		},
		http.StatusOK,
		&cart.UpdateCartItemPayload{},
	)(c)
}

func (h *CartHandler) GetCartItems(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, query *cart.GetCartItemsQuery) (*model.PaginatedResponse[cart.CartItem], error) {
			return h.CartService.GetCartItems(c, query)
		},
		http.StatusOK,
		&cart.GetCartItemsQuery{},
	)(c)
}

func (h *CartHandler) DeleteCartItem(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *cart.DeleteCartItemPayload) (interface{}, error) {
			return nil, h.CartService.DeleteCartItem(c, payload)
		},
		http.StatusNoContent,
		&cart.DeleteCartItemPayload{},
	)(c)
}



// ==================================================
// GET CART TOTALS
// ==================================================

func (h *CartHandler) GetCartTotals(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, query *cart.GetCartTotalsQuery) (*cart.GetCartTotalsResponse, error) {
			userID := middleware.GetUserID(c)
			query.UserID = userID

			

			return h.CartService.GetCartTotals(c, query)
		},
		http.StatusOK,
		&cart.GetCartTotalsQuery{},
	)(c)
}
	

// ==================================================
// APPLY COUPON
// ==================================================

func (h *CartHandler) ApplyCoupon(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *coupon.ApplyCouponPayload) (interface{}, error) {
			userID := middleware.GetUserID(c)
			payload.UserID = userID
			discout,err := h.CartService.ApplyCoupon(c, payload)
			if( err != nil){
				return  nil, err
			}
			return map[string]interface{}{ "discoutAmount":discout}, nil
		},
		http.StatusCreated,
		&coupon.ApplyCouponPayload{},
	)(c)
}