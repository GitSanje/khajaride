package service

import (
	"fmt"
	"log"
	"sync"

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


func (s *SearchService) BulkInsertIndexes(ctx echo.Context, indexName string, payload []byte) error {
    var BulkInputs []map[string]interface{}

    switch indexName {
    case "vendors":
        BulkInputs, _ = utils.TransformFoodManduVendorsForES(payload)
       
    case "menus":
        BulkInputs, _ = utils.TransformFoodManduMenuItemsForES(payload)
		
    default:
        return fmt.Errorf("unsupported index name: %s", indexName)
    }
	log.Println("length of docs", len(BulkInputs), BulkInputs[0])
     
    const maxWorkers = 5
    const chunkSize = 500

    jobs := make(chan []map[string]interface{}, maxWorkers)
    var wg sync.WaitGroup

    // Start workers
    for w := 1; w <= maxWorkers; w++ {
        wg.Add(1)
        go s.searchRepo.BulkIndexWorker(ctx.Request().Context(), indexName, jobs, &wg, w)
    }

    // Feed jobs in chunks
    for i := 0; i < len(BulkInputs); i += chunkSize {
        end := i + chunkSize
        if end > len(BulkInputs) {
            end = len(BulkInputs)
        }
        jobs <- BulkInputs[i:end]
    }

    close(jobs)
    wg.Wait()

    return nil
}
