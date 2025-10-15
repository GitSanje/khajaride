package repository

import (
	"bytes"
	"context"
	"encoding/json"
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
