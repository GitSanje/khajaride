package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)



func registerVendorRoutes(r *echo.Group, h *handler.VendorHandler, auth *middleware.AuthMiddleware) {

	// ------------------- Vendors -------------------
	vendor := r.Group("/vendors")
	vendor.POST("/bulk", h.CreateVendors)
	vendor.POST("", h.CreateVendor)
	vendor.POST("/menuItemsWithCategory", h.CreateMenuItemsWithCategory)     
    
    vendor.GET("",h.GetVendors)
	vendor.GET("/:id", h.GetVendorByID)

	vendor.POST("/upload-images",h.UploadImages)
	
	//------------------- Vendor Address -------------------
	vendor.POST("/addresses",h.CreateVendorAddress)
    

	
}
