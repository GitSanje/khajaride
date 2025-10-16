package search

import (
	"errors"
	"fmt"
	"strings"
)

type InsertDocPayload struct {
    IndexName string                 `json:"index_name"`
    Doc       map[string]interface{} `json:"doc"`
}

func (p InsertDocPayload) Validate() error {
    if p.IndexName == "" {
        return fmt.Errorf("index_name is required")
    }
    if p.Doc == nil {
        return fmt.Errorf("doc is required")
    }
    return nil
}


// ---------------------Search Query Params -----------
type SearchParamsPayload struct {

   Query string `json:"query" validate:"required"`
   PageSize int `json:"page_size"`
   LastSort []interface{} `json:"last_sort,omitempty"` // Used for deep pagination (Elasticsearch's search_after)
   IsVegetarian *bool `json:"is_vegetarian,omitempty"`
   City string `json:"city,omitempty"`
	

}

func (p *SearchParamsPayload) Validate() error {
	if strings.TrimSpace(p.Query) == "" {
		return errors.New("query is required")
	}
	if p.PageSize <= 0 {
		p.PageSize = 20
	}
	return nil
}