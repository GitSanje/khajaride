package handler

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gitSanje/khajaride/internal/model/search"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)


type SearchHandler struct {
	Handler
	SearchService *service.SearchService

}


func NewSearchHandler(s *server.Server, ss *service.SearchService) *SearchHandler {
	return &SearchHandler{
		Handler:     NewHandler(s),
		SearchService: ss,
	}
}

// curl -X POST http://localhost:8080/api/v1/search/bulk-insert \
//   -F "index_name=vendors" \
//   -F "file=@new_vendors.json"



func (h *SearchHandler) InsertBulkDocs(c echo.Context) error {

	// Get form field "index_name"
	indexName := c.FormValue("index_name")
	if indexName == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "index_name is required")
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to get uploaded file: %v", err))
	}

	f, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to open uploaded file: %v", err))
	}
	defer f.Close()

	// Read file content
	payload, err := io.ReadAll(f)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to read uploaded file: %v", err))
	}

	if err := h.SearchService.BulkInsertIndexes(c, indexName, payload); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": fmt.Sprintf("Bulk documents inserted successfully into index '%s'", indexName),
	})
}


func (h *SearchHandler) InsertDocument(c echo.Context) error {


	return  Handle(
		h.Handler,
		func(c echo.Context, payload *search.InsertDocPayload) (interface{}, error) {
			err := h.SearchService.InsertDocument(c, payload)
			if err != nil {
				return nil, err
			}
			return map[string]string{"message": "document inserted successfully"}, nil
         },
		http.StatusCreated,
		&search.InsertDocPayload{},
		)(c)
}