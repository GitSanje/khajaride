package coupon

import "github.com/go-playground/validator/v10"

//-- ==================================================
//-- APPLY CouponPayload
//-- ==================================================



type ApplyCouponPayload struct {
	UserID       string  `json:"userId"` 
	CartVendorID  string  `json:"cartVendorId" validate:"required"`
	VendorID     string  `json:"vendorId" validate:"required"`
	CouponCode   *string  `json:"couponCode,omitempty"`
	Subtotal     float64 `json:"subtotal"`
}

func (p *ApplyCouponPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}