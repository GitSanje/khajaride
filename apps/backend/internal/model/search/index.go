package search

type VendorIndex struct {
	ID               string   `json:"id"`               // keyword
	Name             string   `json:"name"`             // text
	About            string   `json:"about"`            // text
	Cuisine          string   `json:"cuisine"`          // text
	CuisineTags      string   `json:"cuisine_tags"`     // text array
	VendorType       string   `json:"vendor_type"`      // keyword
	Rating           float64  `json:"rating"`           // float
	FavoriteCount    int      `json:"favorite_count"`   // integer
	IsOpen           bool     `json:"is_open"`          // boolean
	IsFeatured       bool     `json:"is_featured"`      // boolean
	DeliveryAvailable bool    `json:"delivery_available"` // boolean
	PickupAvailable  bool     `json:"pickup_available"` // boolean
	DeliveryFee      float64  `json:"delivery_fee"`     // float
	MinOrderAmount   float64  `json:"min_order_amount"` // float
	PromoText        string   `json:"promo_text"`       // text
	VendorNotice     string   `json:"vendor_notice"`    // text
	Location         GeoPoint `json:"location"`         // geo_point
	StreetAddress    string   `json:"street_address"`   // text
	City             string   `json:"city"`             // keyword
	State            string   `json:"state"`            // keyword
	ZipCode          string   `json:"zip_code"`         // keyword
}

// For Elasticsearch geo_point type
type GeoPoint struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}


type MenuIndex struct {
	ID           string   `json:"id"`           // keyword
	VendorID     string   `json:"vendor_id"`    // keyword
	Name         string   `json:"name"`         // text
	Description  string   `json:"description"`  // text
	Tags         string   `json:"tags"`         // text 
	Keywords     string   `json:"keywords"`     // text 
	BasePrice    float64  `json:"base_price"`   // float
	IsAvailable  bool     `json:"is_available"` // boolean
	IsPopular    bool     `json:"is_popular"`   // boolean
	IsVegetarian bool     `json:"is_vegetarian"` // boolean
	IsVegan      bool     `json:"is_vegan"`      // boolean
	IsGlutenFree bool     `json:"is_gluten_free"` // boolean
	SpicyLevel   int      `json:"spicy_level"`    // integer
	PortionSize  string   `json:"portion_size"`   // keyword
	Category     Category `json:"category"`       // nested object
}

type Category struct {
	ID   string `json:"id"`   // keyword
	Name string `json:"name"` // text with raw keyword field
}

