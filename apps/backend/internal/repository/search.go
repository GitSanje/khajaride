package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"

	"github.com/gitSanje/khajaride/internal/model/search"
	"github.com/gitSanje/khajaride/internal/server"
)

// ---------------- Vendor Repository ----------------

type SearchRepository struct {
	server *server.Server
}

func NewSearchRepository(s *server.Server) *SearchRepository {
	return &SearchRepository{server: s}
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

func (r *SearchRepository) FullTextSearch(ctx context.Context, payload *search.SearchParamsPayload) (map[string]interface{}, error) {

	// Default page size
	if payload.PageSize <= 0 {
		payload.PageSize = 20
	}

	// Escape double quotes and special JSON chars
	escapedQuery := strings.ReplaceAll(payload.Query, `"`, `\"`)
	// --------------------- Build Filter Clauses ---------------------
	filters := []string{`{ "term": { "is_available": true } }`}

	if payload.IsVegetarian != nil {
		filters = append(filters, fmt.Sprintf(`{ "term": { "is_vegetarian": %v } }`, *payload.IsVegetarian))
	}

	if payload.City != "" {
		filters = append(filters, fmt.Sprintf(`{ "term": { "vendor.city": "%s" } }`, payload.City))
	}

	// ---------------- Add geo filter (if location present) ----------------
	hasLocation := payload.UserLatitude != nil && payload.UserLongitude != nil
	if hasLocation {
		radius := 5000.0 // Default 5km
		if payload.RadiusMeters != nil {
			radius = *payload.RadiusMeters
		}
		geoFilter := fmt.Sprintf(`{
		"geo_distance": {
			"distance": "%fm",
			"vendor.location": {
				"lat": %f,
				"lon": %f
			}
		}
	}`, radius, *payload.UserLatitude, *payload.UserLongitude)
		filters = append(filters, geoFilter)
	}

	// Join filters
	filterClause := strings.Join(filters, ",")

	// --------------------- Build Base Query ---------------------
	query := fmt.Sprintf(`
	{
	  "query": {
	    "bool": {
	      "must": [
	        {
	          "multi_match": {
	            "query": "%s",
	            "fields": [
	              "menu_name^5",
	              "menu_description^2",
	              "tags^3",
	              "keywords^3",
	              "category.name^2",
	              "vendor.name^2",
	              "vendor.cuisine^2"
	            ],
	            "fuzziness": "AUTO",
	            "operator": "and"
	          }
	        }
	      ],
	      "filter": [%s],
	      "should": [
	        { "term": { "is_popular": true } },
	        { "range": { "vendor.rating": { "gte": 4.2, "boost": 2 } } }
	      ]
	    }
	  },
	  "sort": [
	    { "_score": "desc" },
	    { "vendor.rating": "desc" }
	  ], 
      "size": %d
	}`, escapedQuery, filterClause, payload.PageSize)

	// ---------------- Add geo sorting  ----------------
	if hasLocation {
		geoSort := fmt.Sprintf(`,
		  { "_geo_distance": {
				"vendor.location": {
					"lat": %f,
					"lon": %f
				},
				"order": "asc",
				"unit": "m",
				"distance_type": "arc"
			}
				},
		`, *payload.UserLatitude, *payload.UserLongitude)
		query = strings.Replace(query, `{ "_score": "desc" },`, `{ "_score": "desc" }`+geoSort, 1)
	}

	// --------------------- Add search_after (for deep pagination) ---------------------
	if len(payload.LastSort) > 0 {
		sortJSON, err := json.Marshal(payload.LastSort)
		if err != nil {
			return nil, fmt.Errorf("invalid search_after sort values: %w", err)
		}
		query = strings.TrimSuffix(query, "}") + fmt.Sprintf(`, "search_after": %s}`, sortJSON)
	}
    
	fmt.Println("ES Query:", query)
	// --------------------- Execute Search ---------------------
	res, err := r.server.Elasticsearch.Search(
		r.server.Elasticsearch.Search.WithContext(ctx),
		r.server.Elasticsearch.Search.WithIndex("vendor_menu"),
		r.server.Elasticsearch.Search.WithBody(strings.NewReader(query)),
		r.server.Elasticsearch.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return nil, fmt.Errorf("elasticsearch search error: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("search response error: %s", res.String())
	}

	var raw map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("error parsing ES response: %w", err)
	}

	hitsData := raw["hits"].(map[string]interface{})
	hitsArray := hitsData["hits"].([]interface{})
	results := make([]map[string]interface{}, 0, len(hitsArray))
	for _, h := range hitsArray {
		hit := h.(map[string]interface{})
		source := hit["_source"].(map[string]interface{})
		sortVal := hit["sort"]
		source["sort"] = sortVal
		results = append(results, source)
	}

	total := int64(0)
	if t, ok := hitsData["total"].(map[string]interface{}); ok {
		if v, ok := t["value"].(float64); ok {
			total = int64(v)
		}
	}
	lastSort := []interface{}{}
	if len(hitsArray) > 0 {
		lastHit := hitsArray[len(hitsArray)-1].(map[string]interface{})
		if s, ok := lastHit["sort"].([]interface{}); ok {
			lastSort = s
		}
	}
	response := map[string]interface{}{
		"results":   results,
		"total":     total,
		"took":      raw["took"],
		"last_sort": lastSort,
	}

	return response, nil

}
