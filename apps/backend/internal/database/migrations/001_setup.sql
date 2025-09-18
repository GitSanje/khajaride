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



CREATE OR REPLACE FUNCTION audit_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    performer_uuid UUID;
BEGIN
    -- Get current app user; if not set, default to system user
    performer_uuid := COALESCE(current_setting('my.app_user', true)::uuid,
                               '00000000-0000-0000-0000-000000000001'::uuid);

    -- Only log if loyalty_points actually changed
    IF NEW.loyalty_points <> OLD.loyalty_points THEN
        INSERT INTO loyalty_points_audit(
            user_id,
            operation,
            points_change,
            old_points,
            new_points,
            reason,
            performed_by
        )
        VALUES (
            NEW.id,
            CASE WHEN NEW.loyalty_points > OLD.loyalty_points THEN 'ADD' ELSE 'SUBTRACT' END,
            abs(NEW.loyalty_points - OLD.loyalty_points),
            OLD.loyalty_points,
            NEW.loyalty_points,
            TG_ARGV[0],       -- optional reason passed from update
            performer_uuid
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
