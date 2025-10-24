package order

import "github.com/gitSanje/khajaride/internal/model"

type OrderItem struct {
	model.Base

	OrderVendorID       string   `json:"orderVendorId" db:"order_vendor_id"`
	CartItemID         *string  `json:"cartItemId,omitempty" db:"cart_item_id"`
	MenuItemID          string   `json:"menuItemId" db:"menu_item_id"`
	Quantity            int      `json:"quantity" db:"quantity"`
	UnitPrice           float64  `json:"unitPrice" db:"unit_price"`
	DiscountAmount      float64  `json:"discountAmount" db:"discount_amount"`
	SpecialInstructions *string  `json:"specialInstructions,omitempty" db:"special_instructions"`
	Subtotal            float64  `json:"subtotal" db:"subtotal"`
}
