package service

import (
	"encoding/json"
	"log"
	"sync"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model/search"
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

    if err := json.Unmarshal(payload,&BulkInputs); err != nil {
        return err
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


func ( s *SearchService) InsertDocument ( ctx echo.Context,  payload *search.InsertDocPayload) error {
	logger := middleware.GetLogger(ctx)


    err := s.searchRepo.InsertDocument(ctx.Request().Context(), payload.IndexName, payload.Doc)
    if err != nil {
        logger.Error().
            Err(err).
            Str("index_name", payload.IndexName).
            Msg("Failed to insert index in repository")
        return  err
    }

	 logger.Info().
        Msg("Doc on {indexName} inserted successfully")

    return  nil
}

func ( s *SearchService) FullTextSearch ( ctx echo.Context,  payload *search.SearchParamsPayload) (map[string]interface{}, error) {
	logger := middleware.GetLogger(ctx)


    result, err := s.searchRepo.FullTextSearch(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().
            Err(err).
            Msg("Failed to search")
        return nil, err
    }
	
    return  result, nil
}