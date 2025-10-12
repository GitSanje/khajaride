package vendor

import "github.com/gitSanje/khajaride/internal/model"

type VendorAddress struct {
	model.Base
	VendorID      string  `json:"vendorId" db:"vendor_id"`
	StreetAddress string  `json:"streetAddress" db:"street_address"`
	City          string  `json:"city" db:"city"`
	State         string  `json:"state" db:"state"`
	ZipCode       string  `json:"zipcode" db:"zipcode"`
	Latitude      float64 `json:"latitude" db:"latitude"`
	Longitude     float64 `json:"longitude" db:"longitude"`
}
