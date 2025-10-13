package handler

import (
	"io"
	"net/http"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/vendor"
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




// ------------------- GET VENDOR BY ID -------------------
func (h *VendorHandler) GetVendorByID(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *vendor.GetVendorByIDPayload) (*vendor.VendorPopulated, error) {
			return h.VendorService.GetVendorByID(c, payload)
		},
		http.StatusOK,
		&vendor.GetVendorByIDPayload{},
	)(c)
}





// curl -X POST http://localhost:8080/api/v1/vendors/bulk \
//   -F "file=@vendors.json" \
//   -H "Content-Type: multipart/form-data"

func (h *VendorHandler) CreateVendors(c echo.Context) error {
    
	logger := middleware.GetLogger(c)
 

	// Try to get uploaded file first
	file, err := c.FormFile("file")
	var payload []byte
   
	if err != nil {
      return  echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	} 

	// File uploaded: read it
	f, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to open uploaded file")
	}
	defer f.Close()

	payload, err = io.ReadAll(f)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read uploaded file")
	}
	logger.Info().
    Int("payload_length", len(payload)).
    Msg("received vendor payload")


	if err := h.VendorService.CreateVendorInBulk(c, payload); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "vendors inserted successfully",
	})
}


// curl -X POST http://localhost:8080/api/v1/vendors/menuItemsWithCategory \
//   -F "file=@foodmandu_all_menu_items.json" \
//   -H "Content-Type: multipart/form-data"

func (h *VendorHandler) CreateMenuItemsWithCategory(c echo.Context) error {
    
	// Try to get uploaded file first
	file, err := c.FormFile("file")
	var payload []byte
   
	if err != nil {
      return  echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	} 

	// File uploaded: read it
	f, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to open uploaded file")
	}
	defer f.Close()

	payload, err = io.ReadAll(f)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read uploaded file")
	}
	

	if err := h.VendorService.CreateMenuItemsInBulk(c, payload); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "menuItemsWithcategory inserted successfully",
	})
}



// ------------------- GET VENDORS (PAGINATED) -------------------
func (h *VendorHandler) GetVendors(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *vendor.GetVendorsQuery) (*model.PaginatedResponse[vendor.Vendor], error) {
			return h.VendorService.GetVendors(c, payload)
		},
		http.StatusOK,
		&vendor.GetVendorsQuery{},
	)(c)
}