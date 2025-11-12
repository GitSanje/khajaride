package payment

import (
	"time"

	"github.com/gitSanje/khajaride/internal/model"
)

type OrderPayment struct {
    model.Base
    OrderID        string     `json:"orderId" db:"order_id"`
    PaymentGateway string     `json:"paymentGateway,omitempty" db:"payment_gateway"`
    TransactionID  string     `json:"transactionId,omitempty" db:"transaction_id"`
    Amount         float64    `json:"amount" db:"amount"`
    Status         string     `json:"status" db:"status"` // 'initiated', 'success', 'failed', 'refunded'
    Method         string     `json:"method" db:"method"` // 'esewa', 'khalti', 'card', 'cod'
    PaidAt         *time.Time `json:"paidAt,omitempty" db:"paid_at"`
}


