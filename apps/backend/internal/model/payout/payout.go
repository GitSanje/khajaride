package payout

import "time"

// =========================
// PayoutAccount model
// =========================
type PayoutAccount struct {
	ID                string     `json:"id" db:"id"`
	OwnerID           *string    `json:"ownerId,omitempty" db:"owner_id"` // nullable for system
	OwnerType         string     `json:"ownerType" db:"owner_type"`       // 'vendor' or 'system'
	Method            string     `json:"method" db:"method"`              // esewa, khalti, bank_transfer, cash
	AccountIdentifier string     `json:"accountIdentifier" db:"account_identifier"`
	AccountName       *string    `json:"accountName,omitempty" db:"account_name"`
	BankName          *string    `json:"bankName,omitempty" db:"bank_name"`
	BranchName        *string    `json:"branchName,omitempty" db:"branch_name"`
	IsDefault         bool       `json:"isDefault" db:"is_default"`
	Verified          bool       `json:"verified" db:"verified"`
	VerificationStatus string    `json:"verificationStatus" db:"verification_status"` // pending, verified, rejected
	Remarks           *string    `json:"remarks,omitempty" db:"remarks"`
	Code              string     `json:"code" db:"code"`
	Mode              string     `json:"mode" db:"mode"`
	CreatedAt         time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time  `json:"updatedAt" db:"updated_at"`
	VerifiedAt        *time.Time `json:"verifiedAt,omitempty" db:"verified_at"`
}

// =========================
// Payout model
// =========================
type Payout struct {
	ID            string     `json:"id" db:"id"`
	VendorID      string     `json:"vendorId,omitempty" db:"vendor_id"`     // nullable for system-level payouts
	OrderID       string    `json:"orderId,omitempty" db:"order_id"`       // nullable for system-level payouts
	AccountID     string     `json:"accountId" db:"account_id"`             // references PayoutAccount
	AccountType   string     `json:"accountType" db:"account_type"`         // 'vendor' or 'system'
	PayoutType    string     `json:"payoutType" db:"payout_type"`           // vendor_payout, commission, refund, adjustment
	Method        string     `json:"method" db:"method"`                     // esewa, khalti, bank_transfer, cash, card
	Amount        float64    `json:"amount" db:"amount"`
	Status        string     `json:"status" db:"status"`                     // pending, completed, failed
	TransactionRef *string   `json:"transactionRef,omitempty" db:"transaction_ref"`
	Remarks       *string    `json:"remarks,omitempty" db:"remarks"`
	CreatedAt     time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time  `json:"updatedAt" db:"updated_at"`
}
