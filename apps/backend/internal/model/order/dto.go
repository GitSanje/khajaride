package order

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type PaymentDetails struct {
	PaymentMethod  string  `json:"paymentMethod" validate:"required"`
	Amount         float64 `json:"amount" validate:"required,min=0"`
	Method         string  `json:"method" validate:"required"`
	PaymentGateway string  `json:"paymentGateway"`
}

type CreateOrderPayload struct {
	UserID               *string         `json:"userID"`
	CartVendorId         string         `json:"cartVendorId" validate:"required"`
	DeliveryAddressId    string         `json:"deliveryAddressId" validate:"required"`
	DeliveryInstructions string         `json:"deliveryInstructions"`
	ExpectedDeliveryTime time.Duration  `json:"expectedDeliveryTime"`
}

func (p *CreateOrderPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}
