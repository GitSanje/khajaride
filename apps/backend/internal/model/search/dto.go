package search

import "fmt"

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
