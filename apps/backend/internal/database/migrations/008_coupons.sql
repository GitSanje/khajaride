
-- =========================
-- COUPONS (discount definitions)
-- =========================
CREATE TABLE coupons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    code VARCHAR(50) UNIQUE NOT NULL,             -- e.g., "FIRST20"
    vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE, 
                                                  -- NULL = global coupon
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')), 
    discount_value NUMERIC(10,2) NOT NULL,        -- e.g., 20 for 20% or 100 for NPR 100 off


   -- Conditional (require min order, first-time user, or limited time)
    min_order_amount NUMERIC(10,2) DEFAULT 0.0,   -- optional threshold
    max_discount_amount NUMERIC(10,2),            -- for percent coupons: e.g., max ₹500 off
    usage_limit INT DEFAULT NULL,                 -- total times coupon can be used
    per_user_limit INT DEFAULT 1,                 -- times per user
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_updated_at_coupons
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();




-- =========================
-- COUPONS USAGE TRACKING
-- =========================

CREATE TABLE coupon_usages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id TEXT, -- nullable until order is created
    used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, user_id, order_id)
);
CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages(user_id);