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


type KhaltiCallbackPayload struct {
	Pidx              string  `query:"pidx"`
	TxnID             string  `query:"txnId"`
	Amount            float64 `query:"amount"`
	TotalAmount       float64 `query:"total_amount"`
	Status            string  `query:"status"`
	Mobile            string  `query:"mobile"`
	Tidx              string  `query:"tidx"`
	PurchaseOrderID   string  `query:"purchase_order_id"`
	PurchaseOrderName string  `query:"purchase_order_name"`
	TransactionID     string  `query:"transaction_id"`
}

func (p *KhaltiCallbackPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



type KhaltiPaymentResponse struct {
	Pidx       string `json:"pidx"`
	PaymentURL string `json:"payment_url"`
	ExpiresAt  string `json:"expires_at"`
	ExpiresIn  int    `json:"expires_in"`
}



type StripePaymentPayload struct {
	PurchaseOrderID   string  `json:"purchase_order_id"`
	PurchaseOrderName string  `json:"purchase_order_name"`
	Amount            float64 `json:"amount"`
	Currency          *string  `json:"currency"`
}

func (p *StripePaymentPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type StripePaymentResponse struct {
	PaymentUrl       string `json:"url"`
}


type StripeVerifyPayload struct {
	SessionID         string  `query:"session_id"`
	PurchaseOrderID   string  `query:"purchase_order_id"`
	PurchaseOrderName string  `query:"purchase_order_name"`
	Amount            float64 `query:"amount"`

}


func (p *StripeVerifyPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


type OnboardingPayload struct {
	VendorUserId   string  `json:"vendorUserId"  validate:"required"`
}
func (p *OnboardingPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type OnboardingAccountLinkPayload struct {
	AccountId   string  `json:"accountId"  validate:"required"`
}
func (p *OnboardingAccountLinkPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type OnboardingResponse struct {
	URL string `json:"url"`
}
