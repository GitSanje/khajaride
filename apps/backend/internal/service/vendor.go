package service

import (
	
	"github.com/gitSanje/khajaride/internal/lib/utils"
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
