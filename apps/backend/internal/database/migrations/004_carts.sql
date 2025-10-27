

-- =========================
-- recalc_cart_vendor_totals
-- =========================

CREATE OR REPLACE FUNCTION recalc_cart_vendor_totals(p_cart_vendor_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_subtotal NUMERIC(10,2);
BEGIN
    -- Calculate subtotal from cart items
    SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
    FROM cart_items
    WHERE cart_vendor_id = p_cart_vendor_id;

    -- Update cart_vendor totals using vendor rates
    UPDATE cart_vendors cv
    SET 
        subtotal = v_subtotal,
        vendor_service_charge = ROUND(v_subtotal * v.vendor_service_charge / 100, 2),
        vat = ROUND(v_subtotal * v.vat / 100, 2),
        vendor_discount = ROUND(v_subtotal * v.vendor_discount / 100, 2)
    FROM vendors v
    WHERE cv.vendor_id = v.id
    AND cv.id = p_cart_vendor_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION trigger_recalc_cart_vendor_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalc_cart_vendor_totals(NEW.cart_vendor_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- =========================
-- update_cart_item_discount
-- =========================

-- Trigger function to update cart item discount
CREATE OR REPLACE FUNCTION trigger_update_cart_item_discount()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update discount for INSERT or UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        NEW.discount_amount := (
            SELECT discount_amount
            FROM menu_items
            WHERE id = NEW.menu_item_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;





-- =========================
-- CART SESSION (one per active cart per user)
-- =========================

CREATE TABLE cart_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'checked_out', 'abandoned')),
    currency TEXT DEFAULT 'NPR',
  
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_sessions_user_id ON cart_sessions(user_id);
CREATE INDEX idx_cart_sessions_status ON cart_sessions(status);

CREATE TRIGGER set_updated_at_cart_sessions
    BEFORE UPDATE ON cart_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


-- =========================
-- CART VENDORS (grouping by VENDORS)
-- =========================
CREATE TABLE cart_vendors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    cart_session_id TEXT NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    subtotal NUMERIC(10,2) DEFAULT 0,
    applied_coupon_code TEXT, --“20% off your first purchase[FIRST20]” 
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'checked_out')),
    delivery_charge NUMERIC(10,2), --NULL → TBD (not yet calculated)
    vendor_service_charge  NUMERIC(10,2) DEFAULT 0,
    vat NUMERIC(10,2) DEFAULT 0,
    vendor_discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) GENERATED ALWAYS AS ((subtotal + COALESCE(delivery_charge,0)+ vat+ vendor_service_charge) - vendor_discount) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_session_id, vendor_id)
);


CREATE INDEX idx_cart_vendors_cart_session_id ON cart_vendors(cart_session_id);
CREATE INDEX idx_cart_vendors_vendor_id ON cart_vendors(vendor_id);

CREATE TRIGGER set_updated_at_cart_vendors
    BEFORE UPDATE ON cart_vendors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- =========================
-- CART ITEMS
-- =========================
CREATE TABLE cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    cart_vendor_id TEXT NOT NULL REFERENCES cart_vendors(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL, 
    special_instructions TEXT,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS ((quantity * (unit_price - discount_amount))) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_cart_items_cart_vendor_id ON cart_items(cart_vendor_id);
CREATE INDEX idx_cart_items_menu_item_id ON cart_items(menu_item_id);

CREATE TRIGGER set_updated_at_cart_items
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER cart_items_before_discount
    BEFORE INSERT OR UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_cart_item_discount();


CREATE TRIGGER cart_items_after_change
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_cart_vendor_totals();