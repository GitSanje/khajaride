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
	vendorMapping := `{
			"mappings": {
				"properties": {
				"id": {"type": "keyword"},
				"name": {"type": "text", "analyzer": "english"},
				"about": {"type": "text", "analyzer": "english"},
				"cuisine": {"type": "text", "analyzer": "english"},
				"cuisine_tags": {"type": "text"},
				"vendor_type": {"type": "keyword"},
				"rating": {"type": "float"},
				"favorite_count": {"type": "integer"},
				"is_open": {"type": "boolean"},
				"is_featured": {"type": "boolean"},
				"delivery_available": {"type": "boolean"},
				"pickup_available": {"type": "boolean"},
				"delivery_fee": {"type": "float"},
				"min_order_amount": {"type": "float"},
				"promo_text": {"type": "text", "analyzer": "english"},
				"vendor_notice": {"type": "text", "analyzer": "english"},
				"location": {"type": "geo_point"},
				"street_address": {"type": "text", "analyzer": "english"},
				"city": {"type": "keyword"},
				"state": {"type": "keyword"},
				"zip_code": {"type": "keyword"}
				}
			    }
			  }
			`	

	menuMapping := `{
			"mappings": {
				"properties": {
					"id": {"type": "keyword"},
					"vendor_id": {"type": "keyword"},
					"name": {"type": "text", "analyzer": "english"},
					"description": {"type": "text", "analyzer": "english"},
					"tags": {"type": "text"},
					"keywords": {"type": "text"},
					"base_price": {"type": "float"},
					"is_available": {"type": "boolean"},
					"is_popular": {"type": "boolean"},
					"is_vegetarian": {"type": "boolean"},
					"is_vegan": {"type": "boolean"},
					"is_gluten_free": {"type": "boolean"},
					"spicy_level": {"type": "integer"},
					"portion_size": {"type": "keyword"},
					"category": {
						"properties": {
							"id": {"type": "keyword"},
							"name": {
								"type": "text",
								"analyzer": "english",
								"fields": {
									"raw": {"type": "keyword"}   
                                }
							}
                        }

					}
				}

			}
		}`

	//PUT /vendors
	res, err := i.ES.Indices.Create("vendors", i.ES.Indices.Create.WithBody(strings.NewReader(vendorMapping)))
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("error creating vendors index: %s", res.String())
	}

	res, err = i.ES.Indices.Create("menus", i.ES.Indices.Create.WithBody(strings.NewReader(menuMapping)))
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("error creating menus index: %s", res.String())
	}
	return nil
}