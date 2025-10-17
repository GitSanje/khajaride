package cart

import "github.com/gitSanje/khajaride/internal/model"

type CartItem struct {
	model.Base
	CartVendorID        string   `json:"cartVendorId" db:"cart_vendor_id"`
	MenuItemID          string   `json:"menuItemId" db:"menu_item_id"`
	Quantity            int      `json:"quantity" db:"quantity"`
	UnitPrice           float64  `json:"unitPrice" db:"unit_price"`
	DiscountAmount      float64  `json:"discountAmount" db:"discount_amount"` // per unit
	SpecialInstructions *string  `json:"specialInstructions,omitempty" db:"special_instructions"`
	Subtotal            float64  `json:"subtotal" db:"subtotal"`
}
