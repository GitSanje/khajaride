package handler

import (
	"io"
	"net/http"

	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)


type VendorHandler struct {
	Handler
	VendorService *service.VendorService

}


func NewVendorHandler(s *server.Server, vs *service.VendorService) *VendorHandler {
	return &VendorHandler{
		Handler:     NewHandler(s),
		VendorService: vs,
	}
}


type CreateVendorsPayload struct{}

func (p *CreateVendorsPayload) Validate() error {
	return nil
}

func (h *VendorHandler) CreateVendors(c echo.Context) error {
    // Read body as []byte
    payload, err := io.ReadAll(c.Request().Body)
    if err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "failed to read request body")
    }

    // Call service to insert bulk vendors
    if err := h.VendorService.CreateVendorInBulk(c, payload); err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }

    return c.JSON(http.StatusOK, map[string]string{
        "message": "vendors inserted successfully",
    })
}
