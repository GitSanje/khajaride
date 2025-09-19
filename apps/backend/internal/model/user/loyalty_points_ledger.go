package user

import "github.com/gitSanje/khajaride/internal/model"

type LoyaltyPointsLedger struct {
	model.Base
	ID              string  `json:"id" db:"id"`
	UserID          string  `json:"userId" db:"user_id"`
	TransactionType string  `json:"transactionType" db:"transaction_type"` // EARN, REDEEM, ADJUST
	PointsChange    float64 `json:"pointsChange" db:"points_change"`
	BalanceAfter    float64 `json:"balanceAfter" db:"balance_after"`
	Reason          string  `json:"reason" db:"reason"`
	ReferenceID     *string `json:"referenceId,omitempty" db:"reference_id"`
	ReferenceType   *string `json:"referenceType,omitempty" db:"reference_type"`
	PerformedBy     string  `json:"performedBy" db:"performed_by"`
	PerformedAt     string  `json:"performedAt" db:"performed_at"`
}
