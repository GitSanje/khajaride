package order

import (
	"time"

	"github.com/gitSanje/khajaride/internal/model"
)

type OrderVendor struct {
	model.Base

	UserID               string   `json:"userId" db:"user_id"`
	OrderGroupID         string   `json:"orderGroupId" db:"order_group_id"`
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

	ExpectedDeliveryTime *time.Time `json:"expectedDeliveryTime,omitempty" db:"expected_delivery_time"`
	ActualDeliveryTime   *time.Time `json:"actualDeliveryTime,omitempty" db:"actual_delivery_time"`
	ScheduledFor         *time.Time `json:"scheduledFor,omitempty" db:"scheduled_for"`
	PickupReadyTime      *time.Time `json:"pickupReadyTime,omitempty" db:"pickup_ready_time"`

	RestaurantAcceptedAt *time.Time `json:"restaurantAcceptedAt,omitempty" db:"restaurant_accepted_at"`
	DriverAssignedAt     *time.Time `json:"driverAssignedAt,omitempty" db:"driver_assigned_at"`
	DeliveredAt          *time.Time `json:"deliveredAt,omitempty" db:"delivered_at"`
}


type OrderVendorInfo struct {
	ID         string       `json:"id"`
	Subtotal   float64      `json:"subtotal"`
	Vendor     VendorDetail `json:"vendor"`
	OrderItems []OrderItemInfo  `json:"orderItems"`
}

type VendorDetail struct {
	ID     string   `json:"id"`
	Name   string   `json:"name"`
	ImgURL *string  `json:"imgUrl,omitempty"`
	Rating *float64 `json:"rating,omitempty"`
}

type OrderItemInfo struct {
	ID        string     `json:"id"`
	Quantity  int        `json:"quantity"`
	UnitPrice float64    `json:"unitPrice"`
	MenuItem  MenuDetail `json:"menuItem"`
}

type MenuDetail struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
}

type PopulatedUserOrder struct {
	OrderGroup
	Vendors    []OrderVendorInfo `json:"vendors"`        
}