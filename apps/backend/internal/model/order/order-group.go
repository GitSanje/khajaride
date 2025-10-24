package order

import "github.com/gitSanje/khajaride/internal/model"

type OrderGroup struct {
	model.Base

	UserID        string  `json:"userId" db:"user_id"`
	Total         float64 `json:"total" db:"total"`
	Currency      string  `json:"currency" db:"currency"`
	PaymentStatus string  `json:"paymentStatus" db:"payment_status"`
}
