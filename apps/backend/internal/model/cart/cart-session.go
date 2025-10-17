package cart

import "github.com/gitSanje/khajaride/internal/model"
type CartSession struct {
	model.Base
	UserID           string   `json:"userId" db:"user_id"`
	Status           string   `json:"status" db:"status"` // active | checked_out | abandoned
	Currency         string   `json:"currency" db:"currency"`
	AppliedCouponCode *string `json:"appliedCouponCode,omitempty" db:"applied_coupon_code"`
	
}
