package search

import (
	"strings"
	"fmt"
	elasticsearch "github.com/elastic/go-elasticsearch/v8"
)


type Indexes struct {
	ES *elasticsearch.Client
}

func NewIndexes(s *elasticsearch.Client) *Indexes {
	return &Indexes{ES: s}
}

func (i *Indexes) CreateIndexes() error {
	
	denormalizedVendorMenuMapping := `{
  "mappings": {
    "properties": {
      "menu_id": { "type": "keyword" },
      "menu_name": { "type": "text", "analyzer": "english" },
      "menu_description": { "type": "text", "analyzer": "english" },
      "tags": { "type": "text" },
      "keywords": { "type": "text" },
      "base_price": { "type": "float" },
      "is_available": { "type": "boolean" },
      "is_popular": { "type": "boolean" },
      "is_vegetarian": { "type": "boolean" },
      "is_vegan": { "type": "boolean" },
      "is_gluten_free": { "type": "boolean" },
      "spicy_level": { "type": "integer" },
      "portion_size": { "type": "keyword" },
      "category": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { 
            "type": "text",
            "analyzer": "english",
            "fields": { "raw": { "type": "keyword" } }
          }
        }
      },
      "vendor": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "text", "analyzer": "english" },
          "about": { "type": "text", "analyzer": "english" },
          "cuisine": { "type": "text", "analyzer": "english" },
          "cuisine_tags": { "type": "text" },
          "vendor_type": { "type": "keyword" },
          "rating": { "type": "float" },
          "favorite_count": { "type": "integer" },
          "is_open": { "type": "boolean" },
          "is_featured": { "type": "boolean" },
          "delivery_available": { "type": "boolean" },
          "pickup_available": { "type": "boolean" },
          "delivery_fee": { "type": "float" },
          "min_order_amount": { "type": "float" },
          "promo_text": { "type": "text", "analyzer": "english" },
          "vendor_notice": { "type": "text", "analyzer": "english" },
          "location": { "type": "geo_point" },
          "street_address": { "type": "text", "analyzer": "english" },
          "city": { "type": "keyword" },
          "state": { "type": "keyword" },
          "zip_code": { "type": "keyword" },
          "opening_hours": { "type": "text", "index": false, "store": true },
           "vendor_listing_image_name": { "type": "text", "index": false, "store": true },
           "vendor_logo_image_name": { "type": "text", "index": false, "store": true }
        }
      }
    }
  }
}`


	//PUT /vendors
	res, err := i.ES.Indices.Create("vendor_menu", i.ES.Indices.Create.WithBody(strings.NewReader(denormalizedVendorMenuMapping)))
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("error creating vendor_menu index: %s", res.String())
	}
	return nil
}