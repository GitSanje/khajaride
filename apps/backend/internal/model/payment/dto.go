package payment

import "github.com/go-playground/validator/v10"

type KhaltiPaymentPayload struct {
	Amount          float64      `json:"amount" validate:"required"` 
	PurchaseOrderID string       `json:"purchase_order_id" validate:"required"`
	PurchaseOrderName string     `json:"purchase_order_name" validate:"required"`

}


func (p *KhaltiPaymentPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



type KhaltiVerifyPaymentPayload struct {
	Pidx       string       `json:"pidx" validate:"required"`
}

func (p *KhaltiVerifyPaymentPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type KhaltiVerifyPaymentResponse struct {
	Pidx          string  `json:"pidx"`
	TotalAmount   float64 `json:"total_amount"`
	Status        string  `json:"status"`
	TransactionID string  `json:"transaction_id"`
	Fee           float64 `json:"fee"`
	Refunded      bool    `json:"refunded"`
}


type KhaltiPaymentResponse struct {
	Pidx       string `json:"pidx"`
	PaymentURL string `json:"payment_url"`
	ExpiresAt  string `json:"expires_at"`
	ExpiresIn  int    `json:"expires_in"`
}