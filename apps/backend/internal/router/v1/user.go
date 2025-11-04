package v1

import (
	

	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)


func registerUserRoutes(r *echo.Group, h *handler.UserHandler, auth *middleware.AuthMiddleware) {
	// Protect all /users routes with auth middleware
	user := r.Group("/users")
	user.POST("", h.CreateUser)      // POST /users
	
	user.Use(auth.RequireAuth)
	user.PATCH("/vendor-onboarding-track",h.VendorOnboardingTrack)
	user.GET("/vendor-onboarding-track",h.GetVendorOnboardingTrack)

	// ------------------- Users -------------------
	
	user.GET("/me", h.GetUserByID)   // GET /users/me
	user.PATCH("/me", h.UpdateUser)  // PATCH /users/me
	user.DELETE("/me", h.DeleteUser) // DELETE /users/me
	user.GET("/list", h.GetUsers)      // GET /users/list

	// ------------------- Addresses -------------------
	address := user.Group("/me/addresses")
	address.POST("", h.CreateAddress)                    // POST /users/me/addresses
	address.GET("", h.GetUserAddressByUserID)             // GET /users/me/addresses
	address.GET("/:id", h.GetUserAddressByID)             // GET /users/me/addresses/:id
	address.PATCH("/:id", h.UpdateAddress)               // PATCH /users/me/addresses/:id
	address.DELETE("/:id", h.DeleteAddress)              // DELETE /users/me/addresses/:id
	address.PATCH("/:id/default", h.SetDefaultAddress)   // PATCH /users/me/addresses/:id/default

	// ------------------- Loyalty -------------------
	loyalty := user.Group("/me/loyalty")
	loyalty.GET("", h.GetUserLoyaltyPoints)   // GET /users/me/loyalty (history + balance)
	loyalty.GET("/balance", h.GetCurrentBalance) // GET /users/me/loyalty/balance

	// ------------------- Loyalty (transactions) -------------------
	r.POST("/loyalty/redeem", h.RedeemPoints) // POST /loyalty/redeem
	r.POST("/loyalty/adjust", h.AdjustPoints) // POST /loyalty/adjust (admin only, enforce in handler/middleware)
}
