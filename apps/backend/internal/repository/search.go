package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/gitSanje/khajaride/internal/server"
)

// ---------------- Vendor Repository ----------------


type SearchRepository struct {
	server *server.Server
}
func NewSearchRepository(s *server.Server) *SearchRepository {
	return  &SearchRepository{server: s}
}


func (r *SearchRepository) BulkIndexWorker(ctx context.Context, indexName string, docs <-chan []map[string]interface{}, wg *sync.WaitGroup, workerID int) {


	defer wg.Done()

	for batch := range docs {
	
	
		var buf bytes.Buffer
		for _, doc := range batch {
			
            
			meta := map[string]map[string]string{
                "index": {"_index": indexName},
            }
            if id, ok := doc["id"].(string); ok && id != "" {
                meta["index"]["_id"] = id
            }

            metaLine, _ := json.Marshal(meta)
            docLine, _ := json.Marshal(doc)
            buf.Write(metaLine)
            buf.WriteByte('\n')
            buf.Write(docLine)
            buf.WriteByte('\n')


		}
		res, err := r.server.Elasticsearch.Bulk(bytes.NewReader(buf.Bytes()), r.server.Elasticsearch.Bulk.WithContext(ctx))
        if err != nil {
            log.Printf("[Worker %d] Bulk insert failed: %v", workerID, err)
            continue
        }
        defer res.Body.Close()

        if res.IsError() {
            log.Printf("[Worker %d] Bulk insert returned error: %s", workerID, res.String())
        } else {
            log.Printf("[Worker %d] Successfully indexed %d docs", workerID, len(batch))
        }


	}


	
}


// InsertDocument inserts a single document into the given index
func (r *SearchRepository) InsertDocument(ctx context.Context, indexName string, doc map[string]interface{}) error {
    var buf bytes.Buffer

    // Prepare the meta line for bulk API
    meta := map[string]map[string]string{
        "index": {"_index": indexName},
    }
    if id, ok := doc["id"].(string); ok && id != "" {
        meta["index"]["_id"] = id
    }

    metaLine, err := json.Marshal(meta)
    if err != nil {
        return fmt.Errorf("failed to marshal meta: %w", err)
    }

    docLine, err := json.Marshal(doc)
    if err != nil {
        return fmt.Errorf("failed to marshal document: %w", err)
    }

    // Write meta + doc + newline
    buf.Write(metaLine)
    buf.WriteByte('\n')
    buf.Write(docLine)
    buf.WriteByte('\n')

 
    res, err := r.server.Elasticsearch.Bulk(bytes.NewReader(buf.Bytes()), r.server.Elasticsearch.Bulk.WithContext(ctx))
    if err != nil {
        return fmt.Errorf("bulk insert failed: %w", err)
    }
    defer res.Body.Close()

    if res.IsError() {
        return fmt.Errorf("bulk insert returned error: %s", res.String())
    }

    log.Printf("Document successfully indexed in %s", indexName)
    return nil
}
