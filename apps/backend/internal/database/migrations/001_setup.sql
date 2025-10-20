CREATE OR REPLACE FUNCTION camel(input_row anyelement)
    RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    result jsonb := '{}'; -- -- start with an empty JSON object
    rec record;   -- loop variable to hold each key/value
BEGIN
    FOR rec IN
    SELECT
        -- "first_name" → "firstName"
        lower(substring(regexp_replace(initcap(regexp_replace(key, '_', ' ', 'g')), '\s', '', 'g'), 1, 1)) || substring(regexp_replace(initcap(regexp_replace(key, '_', ' ', 'g')), '\s', '', 'g'), 2) AS camel_key,
        value
    FROM
      -- to_jsonb(input_row) converts the row into JSONB
      -- jsonb_each(...) produces key/value pairs
        jsonb_each(to_jsonb(input_row))
        LOOP
          -- This merges each key-value pair into result.
            result := result || jsonb_build_object(rec.camel_key, rec.value);
        END LOOP;
    RETURN result;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


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
        updated_at = NOW()
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