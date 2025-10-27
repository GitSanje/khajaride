package coupon

import "time"

type Coupon struct {
	ID                string     `db:"id" json:"id"`
	Code              string     `db:"code" json:"code"`
	VendorID          *string    `db:"vendor_id" json:"vendorId,omitempty"` // NULL = global
	Description       *string    `db:"description" json:"description,omitempty"`
	DiscountType      string     `db:"discount_type" json:"discountType"`   // "percent" or "flat"
	DiscountValue     float64    `db:"discount_value" json:"discountValue"` // e.g., 20 or 100
	MinOrderAmount    float64    `db:"min_order_amount" json:"minOrderAmount"`
	MaxDiscountAmount *float64   `db:"max_discount_amount" json:"maxDiscountAmount,omitempty"`
	UsageLimit        *int       `db:"usage_limit" json:"usageLimit,omitempty"`
	PerUserLimit      int        `db:"per_user_limit" json:"perUserLimit"`
	StartDate         *time.Time `db:"start_date" json:"startDate,omitempty"`
	EndDate           *time.Time `db:"end_date" json:"endDate,omitempty"`
	IsActive          bool       `db:"is_active" json:"isActive"`
	CreatedAt         time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt         time.Time  `db:"updated_at" json:"updatedAt"`
}

type CouponUsage struct {
	ID        string     `db:"id" json:"id"`
	CouponID  string     `db:"coupon_id" json:"couponId"`
	UserID    string     `db:"user_id" json:"userId"`
	OrderID   *string    `db:"order_id" json:"orderId,omitempty"` // Nullable until order created
	UsedAt    time.Time  `db:"used_at" json:"usedAt"`
}