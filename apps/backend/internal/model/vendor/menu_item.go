package vendor

import "github.com/gitSanje/khajaride/internal/model"

type MenuItem struct {
	ID string `json:"id" db:"id"`
	model.Base
	VendorID                string   `json:"vendorId" db:"vendor_id"`
	CategoryID              string   `json:"categoryId" db:"category_id"`
	Name                    string   `json:"name" db:"name"`
	Description             string   `json:"description" db:"description"`
	BasePrice               float64  `json:"basePrice" db:"base_price"`
	OldPrice                float64  `json:"oldPrice" db:"old_price"`
	Image                   string   `json:"image" db:"image"`
	IsAvailable             bool     `json:"isAvailable" db:"is_available"`
	IsVegetarian            bool     `json:"isVegetarian" db:"is_vegetarian"`
	IsVegan                 bool     `json:"isVegan" db:"is_vegan"`
	IsPopular               bool     `json:"isPopular" db:"is_popular"`
	IsGlutenFree            bool     `json:"isGlutenFree" db:"is_gluten_free"`
	SpicyLevel              int      `json:"spicyLevel" db:"spicy_level"`
	MostLikedRank           int      `json:"mostLikedRank" db:"most_liked_rank"`
	AdditionalServiceCharge float64  `json:"additionalServiceCharge" db:"additional_service_charge"`
	Tags                    []string `json:"tags" db:"tags"`
	PortionSize             string   `json:"portionSize" db:"portion_size"`
	Keywords                string   `json:"keywords" db:"keywords"`
}


type AddonGroup struct {
	model.Base
	Name        string `json:"name" db:"name"`
	MinChoices  int    `json:"minChoices" db:"min_choices"`
	MaxChoices  int    `json:"maxChoices" db:"max_choices"`
	IsRequired  bool   `json:"isRequired" db:"is_required"`
}

type AddonOption struct {
	model.Base
	GroupID string  `json:"groupId" db:"group_id"`
	Name    string  `json:"name" db:"name"`
	Price   float64 `json:"price" db:"price"`
}

type MenuItemAddon struct {
	model.Base
	MenuItemID   string `json:"menuItemId" db:"menu_item_id"`
	AddonGroupID string `json:"addonGroupId" db:"addon_group_id"`
}


type MenuItemStats struct {
	model.Base
	MenuItemID     string  `json:"menuItemId" db:"menu_item_id"`
	OrderCount     int     `json:"orderCount" db:"order_count"`
	UniqueCustomers int    `json:"uniqueCustomers" db:"unique_customers"`
	ReorderCount   int     `json:"reorderCount" db:"reorder_count"`
	ReorderRate    float64 `json:"reorderRate" db:"reorder_rate"`
	FavoriteCount  int     `json:"favoriteCount" db:"favorite_count"`
	LastOrdered    string  `json:"lastOrdered" db:"last_ordered"`
}