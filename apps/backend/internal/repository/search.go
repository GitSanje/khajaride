package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"


	"github.com/gitSanje/khajaride/internal/server"
)

// ---------------- Vendor Repository ----------------


type SearchRepository struct {
	server *server.Server
}
func NewSearchRepository(s *server.Server) *SearchRepository {
	return  &SearchRepository{server: s}
}


func (r *SearchRepository) BulkIndex(ctx context.Context, indexName string, docs any) error {

	if r == nil {
        return fmt.Errorf("SearchRepository is nil")
    }
    if r.server == nil {
        return fmt.Errorf("SearchRepository.server is nil")
    }
    if r.server.Elasticsearch == nil {
        return fmt.Errorf("Elasticsearch client is nil")
    }
	var slice []interface{}

	// Determine the type of docs
	switch v := docs.(type) {
	case []map[string]interface{}:
		// Already []Document
		for _, doc := range v {
			slice = append(slice, doc)
		}
	default:
		// Assume slice of structs
		b, err := json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal docs: %w", err)
		}

		if err := json.Unmarshal(b, &slice); err != nil {
			return fmt.Errorf("failed to unmarshal docs to slice of interface{}: %w", err)
		}
	}

	if len(slice) == 0 {
		return nil
	}

	var buf bytes.Buffer
	for _, doc := range slice {
		docMap, ok := doc.(map[string]interface{})
		if !ok {
			return fmt.Errorf("doc is not a map[string]interface{} after conversion")
		}

		meta := map[string]map[string]string{
			"index": {"_index": indexName},
		}
		if id, ok := docMap["id"].(string); ok && id != "" {
			meta["index"]["_id"] = id
		}

		metaLine, _ := json.Marshal(meta)
		docLine, _ := json.Marshal(docMap)

		buf.Write(metaLine)
		buf.WriteByte('\n')
		buf.Write(docLine)
		buf.WriteByte('\n')
	}

	res, err := r.server.Elasticsearch.Bulk(bytes.NewReader(buf.Bytes()),r.server.Elasticsearch.Bulk.WithContext(ctx))
	if err != nil {
		return fmt.Errorf("bulk insert failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("bulk insert returned error: %s", res.String())
	}

	return nil
}
