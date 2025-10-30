package order

import (
	"time"

	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/model/vendor"
)

type OrderVendor struct {
	model.Base

	UserID               string   `json:"userId" db:"user_id"`
	VendorCartID         *string  `json:"vendorCartId,omitempty" db:"vendor_cart_id"`
	VendorID             string   `json:"vendorId" db:"vendor_id"`
	Status               string   `json:"status" db:"status"`
	Subtotal             float64  `json:"subtotal" db:"subtotal"`
	DeliveryCharge       float64  `json:"deliveryCharge" db:"delivery_charge"`
	VendorServiceCharge  float64  `json:"vendorServiceCharge" db:"vendor_service_charge"`
	Vat                  float64  `json:"vat" db:"vat"`
	VendorDiscount       float64  `json:"vendorDiscount" db:"vendor_discount"`
	Total                float64  `json:"total" db:"total"`
	Currency             string   `json:"currency" db:"currency"`
	PaymentStatus        string   `json:"paymentStatus" db:"payment_status"`
	FulfillmentType      string   `json:"fulfillmentType" db:"fulfillment_type"`
	DeliveryAddressID    *string  `json:"deliveryAddressId,omitempty" db:"delivery_address_id"`
	DeliveryInstructions *string  `json:"deliveryInstructions,omitempty" db:"delivery_instructions"`

	ExpectedDeliveryTime *time.Duration `json:"expectedDeliveryTime,omitempty" db:"expected_delivery_time"`
	ActualDeliveryTime   *time.Duration`json:"actualDeliveryTime,omitempty" db:"actual_delivery_time"`
	ScheduledFor         *time.Time `json:"scheduledFor,omitempty" db:"scheduled_for"`
	PickupReadyTime      *time.Time `json:"pickupReadyTime,omitempty" db:"pickup_ready_time"`

	RestaurantAcceptedAt *time.Time `json:"restaurantAcceptedAt,omitempty" db:"restaurant_accepted_at"`
	DriverAssignedAt     *time.Time `json:"driverAssignedAt,omitempty" db:"driver_assigned_at"`
	DeliveredAt          *time.Time `json:"deliveredAt,omitempty" db:"delivered_at"`
}


type OrderItems struct {
	MenuItem vendor.MenuItem `json:"menuItem"`
	OrderItem OrderItem    `json:"orderItem"`
}

type VendorInfo struct {
	Name        string  `json:"name"`
	Cuisine     string `json:"cuisine"`
	Image       *string  `json:"image"`
}

type PopulatedUserOrder struct {
	OrderVendor
	OrderItems      []OrderItems   `json:"orderItems"`
	DeliveryAddress user.UserAddress `json:"deliveryAddress"`
	Vendor         VendorInfo     `json:"vendor"`
}