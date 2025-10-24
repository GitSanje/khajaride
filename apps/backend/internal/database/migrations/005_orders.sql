

-- =========================
-- HELPER FUNCTION: recalc_order_vendor_totals(order_vendor_id)
-- =========================

CREATE OR REPLACE FUNCTION recalc_order_vendor_totals(p_order_vendor_id TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$

DECLARE 
   v_subtotal NUMERIC(14,2);
BEGIN
    -- Compute subtotal (sum of all item subtotals)
    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_subtotal
    FROM order_items
    WHERE order_vendor_id = p_order_vendor_id;

    -- Update the order_vendors table
    UPDATE order_vendors
    SET 
        subtotal = v_subtotal,
        updated_at = NOW()
    WHERE id = p_order_vendor_id;
END;
$$;
   


CREATE OR REPLACE FUNCTION trigger_recalc_order_vendor_totals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- When inserting or updating, NEW exists
    -- When deleting, use OLD
    PERFORM recalc_order_vendor_totals(
        COALESCE(NEW.order_vendor_id, OLD.order_vendor_id)
    );

    RETURN NEW;
END;
$$;


-- =========================
-- HELPER FUNCTION: recalc_order_group_total(order_group_id)
-- =========================

CREATE OR REPLACE FUNCTION recalc_order_group_total(p_order_group_id TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_total NUMERIC(14,2);
    v_all_paid BOOLEAN;
BEGIN
    -- Compute total = SUM of all vendor totals in the group
    SELECT COALESCE(SUM(total), 0)
    INTO v_total
    FROM order_vendors
    WHERE order_group_id = p_order_group_id;

    -- Check if all vendors are paid
    SELECT BOOL_AND(payment_status = 'paid')
    INTO v_all_paid
    FROM order_vendors
    WHERE order_group_id = p_order_group_id;

    -- Update the order_groups table
    UPDATE order_groups
    SET 
        total = v_total,
        payment_status = CASE 
                            WHEN v_all_paid THEN 'paid'
                            ELSE 'unpaid'
                         END,
        created_at = created_at, -- to avoid touching created_at
        updated_at = NOW(),
        currency = COALESCE(currency, 'NPR')
    WHERE id = p_order_group_id;
END;
$$;

-- =========================
-- TRIGGER FUNCTION
-- =========================

CREATE OR REPLACE FUNCTION trigger_recalc_order_group_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    PERFORM recalc_order_group_total(
        COALESCE(NEW.order_group_id, OLD.order_group_id)
    );
    RETURN NEW;
END;
$$;









-- =========================
-- ORDER GROUPS
-- =========================

CREATE TABLE order_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NPR',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_updated_at_order_groups
    BEFORE UPDATE ON order_groups
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- =========================
-- ORDER VENDORS
-- =========================

CREATE TABLE order_vendors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_group_id TEXT NOT NULL REFERENCES order_groups(id) ON DELETE CASCADE,
    vendor_cart_id TEXT REFERENCES cart_vendors(id) ON DELETE SET NULL,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',          -- order placed, awaiting vendor acceptance
            'accepted',         -- restaurant/vendor accepted
            'preparing',        -- restaurant started preparing
            'ready_for_pickup', -- waiting for driver/user
            'assigned',         -- driver assigned
            'picked_up',        -- driver picked up the order
            'delivered',        -- order delivered
            'cancelled',        -- cancelled (by user/vendor/system)
            'failed'            -- failed due to payment or logistics
        )
    ),
    
    
    subtotal NUMERIC(10,2) DEFAULT 0,
    delivery_charge NUMERIC(10,2) DEFAULT 0,
    vendor_service_charge  NUMERIC(10,2) DEFAULT 0,
    vat NUMERIC(10,2) DEFAULT 0,
    vendor_discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) GENERATED ALWAYS AS ((subtotal +delivery_charge + vat+ vendor_service_charge) - vendor_discount) STORED,
    currency TEXT DEFAULT 'NPR',
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
    
    fulfillment_type TEXT NOT NULL DEFAULT 'delivery'
        CHECK (fulfillment_type IN ('delivery', 'pickup')),
    
    delivery_address_id TEXT REFERENCES user_addresses(id) ON DELETE SET NULL,
    delivery_instructions TEXT,
    
    expected_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
  

    scheduled_for TIMESTAMPTZ, -- scheduled delivery/pickup
    pickup_ready_time TIMESTAMPTZ, -- for pickup

    restaurant_accepted_at TIMESTAMPTZ,
    driver_assigned_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_vendors_user_id ON order_vendors(user_id);
CREATE INDEX idx_order_vendors_status ON order_vendors(status);

CREATE TRIGGER set_updated_at_order_vendors
    BEFORE UPDATE ON order_vendors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


CREATE TRIGGER trg_recalc_order_group_total
    AFTER INSERT OR UPDATE OR DELETE
    ON order_vendors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_order_group_total();

-- =========================
-- ORDER ITEMS
-- =========================

CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_vendor_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
    cart_item_id TEXT REFERENCES cart_items(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS ((quantity * (unit_price - discount_amount))) STORED,
    special_instructions TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_vendor_id ON order_items(order_vendor_id);

CREATE TRIGGER set_updated_at_order_items
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_recalc_order_vendor_totals
    AFTER INSERT OR UPDATE OR DELETE
    ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_order_vendor_totals();



-- =========================
-- ORDER PAYMENTS
-- =========================

CREATE TABLE order_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
    payment_gateway TEXT,
    transaction_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('initiated', 'success', 'failed', 'refunded')),
    method TEXT CHECK (method IN ('esewa', 'khalti', 'card', 'cod')), --COD-> Cash on Delivery
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_payments_order_id ON order_payments(order_id);

CREATE TRIGGER set_updated_at_order_items
    BEFORE UPDATE ON order_payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- =========================
-- OUTBOX: reliable event staging table
-- =========================

CREATE TABLE outbox (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  aggregate_type TEXT NOT NULL,     -- e.g., 'order', 'order_group'
  aggregate_id TEXT NOT NULL,       -- e.g., order_vendor id
  event_type TEXT NOT NULL,         -- e.g., 'order.paid'
  payload JSONB NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE INDEX idx_outbox_published ON outbox(published);
CREATE INDEX idx_outbox_aggregate ON outbox(aggregate_type, aggregate_id);


CREATE TRIGGER set_updated_at_outbox
    BEFORE UPDATE ON outbox
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- =========================
-- ORDER DRIVERS
-- =========================


-- CREATE TABLE order_drivers (
--     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
--     order_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
--     driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     picked_up_at TIMESTAMPTZ,
--     delivered_at TIMESTAMPTZ,
--     cancelled_at TIMESTAMPTZ,

--     current_lat DOUBLE PRECISION,
--     current_lng DOUBLE PRECISION,

--     status TEXT NOT NULL DEFAULT 'assigned' CHECK (
--         status IN ('assigned', 'enroute_pickup', 'picked_up', 'delivering', 'delivered', 'cancelled')
--     )
-- );

-- CREATE INDEX idx_order_drivers_order_id ON order_drivers(order_id);
-- CREATE INDEX idx_order_drivers_driver_id ON order_drivers(driver_id);



-- -- =========================
-- -- ORDER EVENTS
-- -- =========================


CREATE TABLE order_events (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_events_order_id ON order_events(order_id);
CREATE INDEX idx_order_events_event_type ON order_events(event_type);


CREATE TRIGGER set_updated_at_order_events
    BEFORE UPDATE ON order_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


-- =========================
-- ORDER NOTIFICATIONS
-- =========================


CREATE TABLE order_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'vendor', 'driver')),
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed'))
);



-- =========================
-- ORDER REIVEWS
-- =========================

CREATE TABLE order_reviews (
    id TEXT  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL REFERENCES order_vendors(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_vendor_id ON order_reviews(vendor_id);

CREATE TRIGGER set_updated_at_order_reviews
    BEFORE UPDATE ON order_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
