



-- =========================
-- VENDOR DOCUMENTS
-- =========================

CREATE TABLE vendor_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    document_type TEXT NOT NULL CHECK (
        document_type IN (
            'business_license',
            'pan_vat_registration',
            'bank_account_proof',
            'hygiene_certificate',
            'identity_proof',
            'menu_safety_certificate'
        )
    ),

    document_url TEXT NOT NULL,               -- link to uploaded doc/image
    document_number TEXT,                     -- optional unique number like PAN/VAT number
    expiry_date DATE,                         -- optional, for expirable documents (e.g. hygiene cert)
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected')
    ),

    remarks TEXT,                             -- admin remarks if rejected
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,

    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,  -- admin reviewer
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
CREATE INDEX idx_vendor_documents_status ON vendor_documents(status);
CREATE INDEX idx_vendor_documents_type ON vendor_documents(document_type);





-- =========================
--  PAYOUT ACCOUNTS
-- =========================

CREATE TABLE payout_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    owner_id TEXT,  -- vendor_id for vendor accounts, NULL for system
    owner_type TEXT NOT NULL CHECK (owner_type IN ('vendor', 'system')),

    method TEXT NOT NULL CHECK (
        method IN ('esewa', 'khalti', 'bank_transfer', 'cash')
    ),

    account_identifier TEXT NOT NULL,   -- e.g. esewa id, khalti id, bank acc no
    account_name TEXT,                  -- name on the account
    bank_name TEXT,                     -- for bank transfers
    branch_name TEXT,                   -- optional for banks

    -- Card-specific fields
    --card_provider TEXT,                 -- e.g. 'visa', 'mastercard', 'amex'
    -- card_last4 TEXT CHECK (char_length(card_last4) = 4),
    -- card_expiry_month SMALLINT CHECK (card_expiry_month BETWEEN 1 AND 12),
    -- card_expiry_year SMALLINT CHECK (card_expiry_year BETWEEN 2000 AND 2100),

    is_default BOOLEAN DEFAULT FALSE,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline')),
    code TEXT NOT NULL UNIQUE,                 

    verified BOOLEAN DEFAULT FALSE,     -- after verification by admin or API callback
    verification_status TEXT DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'rejected')
    ),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ
);

CREATE INDEX idx_payout_owner_id ON payout_accounts(owner_id);
CREATE INDEX idx_payout_method ON payout_accounts(method);
CREATE INDEX idx_payout_verified ON payout_accounts(verified);

CREATE TRIGGER set_updated_at_payout_accounts
    BEFORE UPDATE ON payout_accounts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


-- =========================
-- PAYOUTS
-- =========================
CREATE TABLE payouts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

    vendor_id TEXT REFERENCES vendors(id),         -- nullable for system-level payouts
    order_id TEXT REFERENCES order_vendors(id),   -- nullable for system-level payouts
    account_id TEXT REFERENCES payout_accounts(id),
    account_type TEXT NOT NULL CHECK (account_type IN ('vendor', 'system')),

    payout_type TEXT NOT NULL CHECK (
        payout_type IN (
            'vendor_payout',    -- payout to vendor
            'commission',       -- platform commission
            'refund',           -- refund to user
            'adjustment' ,       -- manual adjustments
            'user_payout'
        )
    ),
    
    method TEXT NOT NULL CHECK (method IN ('esewa', 'khalti', 'bank_transfer', 'cash', 'card')),
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_ref TEXT,                          -- txn ref from provider
    remarks TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_vendor_id ON payouts(vendor_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_account_type ON payouts(account_type);
CREATE INDEX idx_payouts_type ON payouts(payout_type);

CREATE TRIGGER set_updated_at_payouts
    BEFORE UPDATE ON payouts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- =========================
-- VENDOR VERIFICATION LOGS
-- =========================

CREATE TABLE vendor_verification_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL CHECK (
        action IN ('submitted', 'approved', 'rejected', 'requested_changes')
    ),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
