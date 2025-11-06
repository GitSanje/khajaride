package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/model/payout"
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

func (pr *PaymentRepository) CreateOrUpdateOrderPayment(ctx context.Context, p *payment.OrderPayment) error {
	existing, err := pr.GetPaymentByOrderID(ctx, p.OrderID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("get existing payment: %w", err)
	}

	
	if existing != nil {
		// If same amount, status, and method → only update transaction ID
		if existing.Amount == p.Amount && existing.Status == p.Status && existing.Method == p.Method {
			query := `
				UPDATE order_payments
				SET transaction_id = @transactionId,
				    updated_at = NOW()
				WHERE id = @id
			`
			_, err = pr.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
				"transactionId": p.TransactionID,
				"id":            existing.ID,
			})
			if err != nil {
				return fmt.Errorf("update existing payment: %w", err)
			}
			return nil
		}

		// Otherwise, update full record
		query := `
			UPDATE order_payments
			SET payment_gateway = @paymentGateway,
			    amount = @amount,
			    status = @status,
			    transaction_id = @transactionId,
			    method = @method,
			    paid_at = NOW(),
			    updated_at = NOW()
			WHERE id = @id
		`
		_, err = pr.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
			"id":             existing.ID,
			"paymentGateway": p.PaymentGateway,
			"amount":         p.Amount,
			"status":         p.Status,
			"transactionId":  p.TransactionID,
			"method":         p.Method,
		})
		if err != nil {
			return fmt.Errorf("update existing payment: %w", err)
		}
		return nil
	}

	// Otherwise, insert new record
	query := `
		INSERT INTO order_payments (
			order_id, payment_gateway, amount, status, transaction_id, method, paid_at, created_at
		)
		VALUES (@orderId, @paymentGateway, @amount, @status, @transactionId, @method, NOW(), NOW())
	`
	_, err = pr.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"orderId":        p.OrderID,
		"paymentGateway": p.PaymentGateway,
		"amount":         p.Amount,
		"status":         p.Status,
		"transactionId":  p.TransactionID,
		"method":         p.Method,
		
	})
	if err != nil {
		return fmt.Errorf("insert new payment: %w", err)
	}

	return nil
}

func (pr *PaymentRepository) GetPaymentByOrderID(ctx context.Context, orderID string) (*payment.OrderPayment, error) {
	query := `SELECT * FROM order_payments WHERE order_id = @orderId LIMIT 1`
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







func (r *PaymentRepository) CreatePayoutAccount(ctx context.Context, acc *payout.PayoutAccount) error {
	query := `
		INSERT INTO payout_accounts (
			owner_id,
			owner_type,
			method,
			account_identifier,
			account_name,
			bank_name,
			branch_name,
			stripe_account_id,
			stripe_external_account_id,
			currency,
			is_default,
			mode,
			code,
			verified,
			verification_status,
			remarks
		) VALUES (
			COALESCE(@owner_id, NULL),
			@owner_type,
			@method,
			COALESCE(@account_identifier, NULL),
			COALESCE(@account_name, ''),
			COALESCE(@bank_name, ''),
			COALESCE(@branch_name, ''),
			COALESCE(@stripe_account_id, ''),
			COALESCE(@stripe_external_account_id, ''),
			COALESCE(@currency, 'USD'),
			COALESCE(@is_default, FALSE),
			@mode,
			@code,
			COALESCE(@verified, FALSE),
			COALESCE(@verification_status, 'pending'),
			COALESCE(@remarks, '')
		)
	`

	args := pgx.NamedArgs{
		"owner_id":                acc.OwnerID,
		"owner_type":              acc.OwnerType,
		"method":                  acc.Method,
		"account_identifier":      acc.AccountIdentifier,
		"account_name":            acc.AccountName,
		"bank_name":               acc.BankName,
		"branch_name":             acc.BranchName,
		"stripe_account_id":       acc.StripeAccountID,
		"stripe_external_account_id": acc.StripeExternalAccount,
		"currency":                acc.Currency,
		"is_default":              acc.IsDefault,
		"mode":                    acc.Mode,
		"code":                    acc.Code,
		"verified":                acc.Verified,
		"verification_status":     acc.VerificationStatus,
		"remarks":                 acc.Remarks,
	}

	_, err := r.server.DB.Pool.Exec(ctx, query, args)
	if err != nil {
		return fmt.Errorf("failed to insert payout account: %w", err)
	}

	return nil
}


func (r *PaymentRepository) GetStripeAccountID(ctx context.Context, vendorUserID string) (string, error) {
	query := `
		SELECT stripe_account_id
		FROM payout_accounts
		WHERE owner_id = $1
		  AND owner_type = 'vendor'
		  AND method = 'stripe'
		LIMIT 1;
	`

	var stripeAccountID string
	err := r.server.DB.Pool.QueryRow(ctx, query, vendorUserID).Scan(&stripeAccountID)
	if err != nil {
		// No row found → return empty string, nil (not an error)
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("failed to fetch stripe account id: %w", err)
	}

	return stripeAccountID, nil
}
