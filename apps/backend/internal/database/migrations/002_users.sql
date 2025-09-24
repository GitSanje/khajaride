CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    password TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    loyalty_points INT DEFAULT 0,
    profile_picture TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2FA tokens table
CREATE TABLE user_2fa_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    token_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);


CREATE INDEX idx_user_2fa_tokens_user_id ON user_2fa_tokens(user_id);
CREATE INDEX idx_user_2fa_tokens_token ON user_2fa_tokens(token);

CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_username ON users(username);

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- User addresses
CREATE TABLE user_addresses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(20) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, label)
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE UNIQUE INDEX one_default_address_per_user ON user_addresses(user_id) WHERE is_default = TRUE;


CREATE TRIGGER set_updated_at_user_addresses
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();







CREATE TABLE loyalty_points_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),   -- the user whose points changed
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('EARN', 'REDEEM', 'ADJUST')),
    points_change NUMERIC(10, 2) NOT NULL,                  -- amount added or subtracted
    balance_after NUMERIC(10, 2) NOT NULL,   
    reason VARCHAR(255),                          -- "Order #1234", "Promo: Double Pizza Points"
    reference_id TEXT,                           -- optional link to order, promo, etc.
    reference_type VARCHAR(50),                  -- e.g., "ORDER", "PROMO", "MANUAL"
    performed_by TEXT NOT NULL REFERENCES users(id), -- who triggered the change (user/system/admin)
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_loyalty_points_ledger_user ON loyalty_points_ledger(user_id);
CREATE INDEX idx_loyalty_points_ledger_performed_by ON loyalty_points_ledger(performed_by);
CREATE INDEX idx_loyalty_points_ledger_user_time ON loyalty_points_ledger(user_id, performed_at DESC);


