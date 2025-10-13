package service

import (
	"github.com/gitSanje/khajaride/internal/lib/utils"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/vendor"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)


type VendorService struct {

  server *server.Server
  vendorRepo *repository.VendorRepository
}

func NewVendorService(s *server.Server, vendorRepo *repository.VendorRepository) *VendorService {
	return &VendorService{
		server:  s,
		vendorRepo: vendorRepo,
	}
}


func ( s *VendorService) GetVendorByID( ctx echo.Context, payload *vendor.GetVendorByIDPayload )  (*vendor.VendorPopulated, error){

	logger := middleware.GetLogger(ctx)


	v, err := s.vendorRepo.GetVendorByID(ctx.Request().Context(), payload)
	if err != nil {
        logger.Error().Err(err).Str("vendorID", payload.ID).Msg("Failed to fetch vendor  by ID")
        return nil, err
    }
        logger.Info().Str("vendorID", payload.ID).Msg("Vendor  fetched successfully")
    
    return  v,nil
}

func ( s *VendorService) CreateVendorInBulk ( ctx echo.Context, payload []byte )  error{

	vendorBulkInputs, err := utils.TransformFoodManduVendors(payload)
	if err != nil {
      return  err
	}
	if err := s.vendorRepo.BulkInsertVendors(ctx.Request().Context(), vendorBulkInputs); err != nil {
		return  err
	}
    
    return  nil
}


func ( s *VendorService) CreateMenuItemsInBulk ( ctx echo.Context, payload []byte )  error{

	menuItemBulkInputs,categoryBulkInputs,vendorcategories , err := utils.TransformFoodManduMenuItems(payload)
	if err != nil {
      return  err
	}
	if err := s.vendorRepo.BulkInsertMenuData(ctx.Request().Context(), categoryBulkInputs, menuItemBulkInputs ,vendorcategories); err != nil {
		return  err
	}
    
    return  nil
}


func (s *VendorService) GetVendors(ctx echo.Context, query *vendor.GetVendorsQuery) (*model.PaginatedResponse[vendor.Vendor], error) {
    logger := middleware.GetLogger(ctx)

    
    
    vendorsPage, err := s.vendorRepo.GetVendors(ctx.Request().Context(), query)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch users from repository")
        return nil, err
    }

    logger.Info().
        Int("page", vendorsPage.Page).
        Int("limit", vendorsPage.Limit).
        Int("total", vendorsPage.Total).
        Int("totalPages", vendorsPage.TotalPages).
        Msg("Users fetched successfully")

    return vendorsPage, nil
}