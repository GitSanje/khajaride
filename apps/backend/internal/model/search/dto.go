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
//27.687584, 85.242394
// ---------------------Search Query Params -----------
type SearchParamsPayload struct {

   Query string `json:"query" validate:"required"`
   PageSize int `json:"page_size"`
   LastSort []interface{} `json:"last_sort,omitempty"` // Used for deep pagination (Elasticsearch's search_after)
   IsVegetarian *bool `json:"is_vegetarian,omitempty"`
   City string `json:"city,omitempty"`
   UserLatitude  *float64      `json:"user_latitude,omitempty"`
   UserLongitude *float64      `json:"user_longitude,omitempty"`
   RadiusMeters  *float64      `json:"radius_meters,omitempty"` 
	

}

func (p *SearchParamsPayload) Validate() error {
	if strings.TrimSpace(p.Query) == "" {
		return errors.New("query is required")
	}
	if p.PageSize <= 0 {
		p.PageSize = 20
	}

   if p.UserLatitude != nil && p.UserLongitude != nil && p.RadiusMeters == nil {
		defaultRadius := 5000.0
		p.RadiusMeters = &defaultRadius
	}

	return nil
}