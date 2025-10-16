package v1

import (
	"github.com/gitSanje/khajaride/internal/handler"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/labstack/echo/v4"
)



func registerSearchRoutes(r *echo.Group, h *handler.SearchHandler, auth *middleware.AuthMiddleware) {

	// ------------------- Search -------------------
	vendor := r.Group("/search")
	vendor.POST("/bulk-insert", h.InsertBulkDocs)
	vendor.POST("/doc-insert",h.InsertDocument)
	vendor.POST("/full-text",h.FullTextSearch)
	
}
