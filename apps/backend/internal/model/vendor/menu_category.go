package vendor

import "github.com/gitSanje/khajaride/internal/model"

type MenuCategory struct {
	model.Base
	VendorID    string `json:"vendorId" db:"vendor_id"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Position    int    `json:"position" db:"position"`
}
