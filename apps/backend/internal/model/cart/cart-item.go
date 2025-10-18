package cart

import (
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/vendor"
)

type CartItem struct {
	model.Base
	CartVendorID        string   `json:"cartVendorId" db:"cart_vendor_id"`
	MenuItemID          string   `json:"menuItemId" db:"menu_item_id"`
	Quantity            int      `json:"quantity" db:"quantity"`
	UnitPrice           float64  `json:"unitPrice" db:"unit_price"`
	DiscountAmount      *float64 `json:"discountAmount" db:"discount_amount"` // per unit
	SpecialInstructions *string  `json:"specialInstructions,omitempty" db:"special_instructions"`
	Subtotal            *float64 `json:"subtotal" db:"subtotal"`
}

type ShortVendorInfo struct {
	VendorId string  `json:"vendorId"`
	Name     string  `json:"name"`
	About    *string `json:"about,omitempty"`
}

type CartMenuItem struct {
	CartItem CartItem        `json:"cartItem"`
	MenuItem vendor.MenuItem `json:"menuItem"`
}

type CartItemPopulated struct {
	CartVendor
	Vendor    ShortVendorInfo `json:"vendor"`
	CartItems []CartMenuItem  `json:"cartItems"`
}
