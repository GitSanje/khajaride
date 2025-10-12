package main

import (
	"fmt"
	"log"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/gitSanje/khajaride/internal/config"
	"github.com/gitSanje/khajaride/internal/lib/search"
)

func main() {
	// Load app configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ failed to load config: %v", err)
	}

	// Initialize Elasticsearch client
	esClient, err := initElasticsearch(cfg)
	if err != nil {
		log.Fatalf("❌ failed to initialize Elasticsearch: %v", err)
	}
	fmt.Println("✅ Connected to Elasticsearch")

	// Create indexes
	indexes := search.NewIndexes(esClient)
	if err := indexes.CreateIndexes(); err != nil {
		log.Fatalf("❌ failed to create indexes: %v", err)
	}

	fmt.Println("🎯 Elasticsearch indexes created successfully")
}

// initElasticsearch creates and validates a new ES client
func initElasticsearch(cfg *config.Config) (*elasticsearch.Client, error) {
	if cfg.Elasticsearch == nil || cfg.Elasticsearch.Address == "" {
		return nil, fmt.Errorf("missing Elasticsearch configuration")
	}

	esClient, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.Elasticsearch.Address},
	})
	if err != nil {
		return nil, fmt.Errorf("error creating Elasticsearch client: %w", err)
	}

	// ping cluster to verify connectivity
	res, err := esClient.Ping()
	if err != nil {
		return nil, fmt.Errorf("error pinging Elasticsearch: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("Elasticsearch ping returned an error: %s", res.String())
	}

	return esClient, nil
}
