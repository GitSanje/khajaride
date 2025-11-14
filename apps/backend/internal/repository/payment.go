package repository

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/gitSanje/khajaride/internal/lib/events"
	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/model/payout"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/jackc/pgx/v5"
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/balance"
	stripepayout "github.com/stripe/stripe-go/v83/payout"
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


func (r *PaymentRepository) GetPayoutAccountID(ctx context.Context, vendorUserID string) (string, error) {
	query := `
		SELECT id
		FROM payout_accounts
		WHERE owner_id = $1
		  AND owner_type = 'vendor'
		  AND method = 'stripe'
		LIMIT 1;
	`

	var ID string
	err := r.server.DB.Pool.QueryRow(ctx, query, vendorUserID).Scan(&ID)
	if err != nil {
		// No row found → return empty string, nil (not an error)
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("failed to fetch stripe account id: %w", err)
	}

	return ID, nil
}

func (r *PaymentRepository) UpdateStripePayoutAccount(ctx context.Context, payload *payout.PayoutAccountUpdatePayload) error {
    query := `
        UPDATE payout_accounts
        SET account_identifier = $1,
            account_name = $2,
            bank_name = $3,
            branch_name = $4,
            verified = $5,
            verification_status = $6,
            verified_at = NOW(),
        WHERE owner_id = $7
          AND stripe_account_id = $8
    `
    res, err := r.server.DB.Pool.Exec(ctx, query,
        payload.AccountIdentifier,
        payload.AccountName,
        payload.BankName,
        payload.BranchName,
        payload.Verified,
        payload.VerificationStatus,
        payload.OwnerID,
        payload.StripeAccountID,
    )
    if err != nil {
        return fmt.Errorf("failed to update payout account: %w", err)
    }

    affected := res.RowsAffected()
    if affected == 0 {
        return fmt.Errorf("no payout account found with owner_id=%s and stripe_account_id=%s", payload.OwnerID, payload.StripeAccountID)
    }

    return nil
}



func (r *PaymentRepository) CreatePayout(ctx context.Context, p *payout.Payout) (string, error) {
	query := `
		INSERT INTO payouts (
			vendor_user_id, order_id, account_id, sender, payout_type,
			method, amount, status, transaction_ref, remarks
		) VALUES (
			@vendor_user_id, @order_id, @account_id, @sender, @payout_type,
			@method, @amount, @status, @transaction_ref, @remarks
		)
		RETURNING id
	`

	args := pgx.NamedArgs{
		"vendor_user_id": p.VendorUserID,
		"order_id":       p.OrderID,
		"account_id":     p.AccountID,
		"sender":         p.Sender,
		"payout_type":    p.PayoutType,
		"method":         p.Method,
		"amount":         p.Amount,
		"status":         p.Status,
		"transaction_ref": p.TransactionRef,
		"remarks":        p.Remarks,
	}

	var id string
	err := r.server.DB.Pool.QueryRow(ctx, query, args).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}



func (r *PaymentRepository) UpdatePayoutStatus(ctx context.Context, pId string,status string) error {
	query := `
		UPDATE payouts
		SET status = @status
		WHERE id = @pid
	`
	_, err := r.server.DB.Pool.Exec(ctx, query,pgx.NamedArgs{
		"pid":pId,
		"status":status,

	  })
	
	return err
}



func (r *PaymentRepository) PerformStripePayout(ctx context.Context, payload *events.PayoutRequestedEvent) (*stripe.Payout, error) {
	// Stripe uses cents
	amt := payload.Amount * 100
	fee:= payload.Amount *100*0.03
    vendorShare := amt - fee
    
	 // ✅ Check balance
    availableUSD, err := r.CheckConnectedAccountBalance(payload.StripeConnectAccId, "usd",true)
	if err != nil {
		return nil,fmt.Errorf("error:%s", err)
	}

	if availableUSD*100 < vendorShare {
        log.Printf("Balance:%f, VendorShare:%f", availableUSD, float64(vendorShare)/100)
        return nil, fmt.Errorf("insufficient funds for payout")
    }

	log.Printf("Balance:%f,VendorShare:%f", availableUSD,vendorShare / 100)

	stripe.Key = r.server.Config.Stripe.SecretKey
	
	params := &stripe.PayoutParams{
		Amount:   stripe.Int64(int64(vendorShare)),
		Currency: stripe.String("usd"),
		
		 Method: stripe.String("instant"),
	}
    
	payoutPayload := &payout.Payout{
			VendorUserID:   &payload.VendorUserID,
			OrderID:        &payload.OrderID,
			AccountID:      &payload.PayoutAccId,
			Sender:         "platform",
			PayoutType:     "vendor_payout",
			Method:         "stripe",
			Amount:          vendorShare / 100,
			Status:         "pending",
			TransactionRef: &payload.SessionId, 
    }
	pid, err := r.CreatePayout(ctx, payoutPayload); 
	
	if err != nil {
	  return nil, fmt.Errorf("create payout: %w", err)
	}

	// Send payout to connected account
	params.SetStripeAccount(payload.StripeConnectAccId)

	// ✅ Embed metadata for traceability
	params.AddMetadata("vendor_id", payload.VendorUserID)
	params.AddMetadata("order_id", payload.OrderID)
	params.AddMetadata("payout_account_id", payload.PayoutAccId)
	params.AddMetadata("payout_type", "vendor_payout")
	params.AddMetadata("payout_id",pid)


	p, err := stripepayout.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create payout: %w", err)
	}
	fmt.Println("✅ Payout sent:", p.ID)
	
	return p, nil
}

func (r *PaymentRepository) CheckConnectedAccountBalance(stripeAccountID string, currency string, instant bool) (float64, error) {
	stripe.Key = r.server.Config.Stripe.SecretKey
    params := &stripe.BalanceParams{}
    params.SetStripeAccount(stripeAccountID)
    
    bal, err := balance.Get(params)
    if err != nil {
        return 0, fmt.Errorf("failed to fetch balance: %w", err)
    }

    balances := bal.Available
    if instant {
        balances = bal.InstantAvailable
    }

    for _, b := range balances {
        if string(b.Currency) == currency {
            return float64(b.Amount) / 100, nil
        }
    }

    return 0, fmt.Errorf("no balance available in currency %s", currency)
}
