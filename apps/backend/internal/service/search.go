package service

import (
	"github.com/gitSanje/khajaride/internal/lib/utils"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)


type SearchService struct {

	server *server.Server
	searchRepo *repository.SearchRepository
}

func NewSearchService(server *server.Server, searchRepo *repository.SearchRepository) *SearchService {
	return &SearchService{
		server: server,
		searchRepo: searchRepo,

	}
}


func (s *SearchService) BulkInsertIndexes(ctx echo.Context,indexName string, payload []byte)error {


	vendorBulkInputs, err := utils.TransformFoodManduVendorsForES(payload)

	if err != nil {
      return  err
	}
	if err := s.searchRepo.BulkIndex(ctx.Request().Context(),indexName, vendorBulkInputs); err != nil {
		return  err
	}
    
    return  nil


}
