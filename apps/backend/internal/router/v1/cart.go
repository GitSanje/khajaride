package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)



func registerCartRoutes(r *echo.Group, h *handler.CartHandler, auth *middleware.AuthMiddleware) {
	// Base group: /carts
	carts := r.Group("/carts") 
    carts.Use(auth.RequireAuth)
    carts.GET("", h.GetActiveCartsByUserID)                // get current user's active cart
	carts.POST("/items", h.AddCartItem)  
	// carts.PATCH("/items/:id", h.UpdateItem) 
	// carts.DELETE("/items/:id", h.RemoveItem)







	// ------------------- Cart Sessions -------------------
	// sessions := carts.Group("/sessions")
	// sessions.POST("", h.CreateCartSession)   // POST /carts/sessions
	// sessions.GET("", h.GetCartSessions)      // GET  /carts/sessions
	// sessions.PATCH("", h.UpdateCartSession)  // PATCH  /carts/sessions
	// sessions.DELETE("", h.DeleteCartSession) // DELETE /carts/sessions

	// // ------------------- Cart Vendors -------------------
	// vendors := carts.Group("/vendors")
	// vendors.POST("", h.CreateCartVendor)   // POST /carts/vendors
	// vendors.GET("", h.GetCartVendors)      // GET  /carts/vendors
	// vendors.PATCH("", h.UpdateCartVendor)    // PATCH  /carts/vendors
	// vendors.DELETE("", h.DeleteCartVendor) // DELETE /carts/vendors

	// // ------------------- Cart Items -------------------
	// items := carts.Group("/items")
	// items.POST("", h.CreateCartItem)   // POST /carts/items
	// items.GET("", h.GetCartItems)      // GET  /carts/items
	// items.PATCH("", h.UpdateCartItem)    // PATCH  /carts/items
	// items.DELETE("", h.DeleteCartItem) // DELETE /carts/items
}
