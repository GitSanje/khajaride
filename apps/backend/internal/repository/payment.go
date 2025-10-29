package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/jackc/pgx/v5"
)

// ---------------- PAYMENT REPOSITORY ----------------

type PaymentRepository struct {
	server *server.Server
}

func NewPaymentRepository(s *server.Server) *PaymentRepository {
	return &PaymentRepository{server: s}
}


func (pr *PaymentRepository) CreateOrderPayment(ctx context.Context, p *payment.OrderPayment) error {

	query := `
		INSERT INTO order_payments (order_id, payment_gateway, amount,  status, transaction_id, method, paid_at)
		VALUES (@orderId, @paymentGateway, @amount, @status, @transactionId, @method, @paidAt)

	`
	Now := time.Now()
	_, err := pr.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"orderId":        p.OrderID,
		"paymentGateway": p.PaymentGateway,
		"amount":         p.Amount,
		"status":         p.Status,
		"transactionId":  p.TransactionID,
		"method":         p.Method,
		"paidAt":         &Now,
	})
	if err != nil {
		return fmt.Errorf("failed to create order payment: %w", err)
	}
	return nil

}

func (pr *PaymentRepository) GetPaymentByOrderID(ctx context.Context, orderID string) (*payment.OrderPayment, error) {
	query := `SELECT order_id, status FROM order_payments WHERE order_id = @orderId LIMIT 1`
	row, err := pr.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{"orderId": orderID})

    if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	p, err := pgx.CollectOneRow(row, pgx.RowToStructByName[payment.OrderPayment])
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (pr *PaymentRepository) UpdatePaymentStatus(ctx context.Context, transactionID, status string) (string, error) {
	query := `
		UPDATE order_payments
		SET status = $1, paid_at = CASE WHEN $1 = 'success' THEN NOW() ELSE paid_at END
		WHERE transaction_id = $2
		RETURNING order_id
	`
	var orderID string
	err := pr.server.DB.Pool.QueryRow(ctx, query, status, transactionID).Scan(&orderID)
	if err != nil {
		return "", err
	}
	return orderID, nil
}




