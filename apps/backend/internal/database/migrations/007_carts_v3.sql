

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


CREATE TRIGGER cart_items_before_discount
    BEFORE INSERT OR UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_cart_item_discount();


CREATE TRIGGER cart_items_after_change
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_cart_vendor_totals();