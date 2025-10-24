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

