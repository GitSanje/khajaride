
-- Restaurants table
CREATE TABLE restaurants (
    id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    about TEXT,                             -- Description/About section
    cuisine VARCHAR(100),                   -- e.g. Italian, Indian, Fusion
    phone VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 0.0,        -- Avg rating (calculated from reviews)
    review_count INT DEFAULT 0,             -- Cached number of reviews
    delivery_available BOOLEAN DEFAULT TRUE,
    pickup_available BOOLEAN DEFAULT TRUE,
    group_order_available BOOLEAN DEFAULT FALSE,
    delivery_fee DECIMAL(5,2) DEFAULT 0.0,  -- base fee (could override by distance later)
    min_order_amount DECIMAL(8,2) DEFAULT 0.0,
    delivery_time_estimate VARCHAR(50),     -- "16-20 min" (approx, cached)
    is_open BOOLEAN DEFAULT TRUE,
    opening_hours JSONB,                    -- {"mon":"09-22", "tue":"09-22"}
    image TEXT,                             -- logo/banner
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);


CREATE TRIGGER set_updated_at_restaurants
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- Restaurant addresses
CREATE TABLE restaurant_addresses (
    id UUID  PRIMARY KEY DEFAULT gen_random_uuid()
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zipcode VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurant_addresses_restaurant_id ON restaurant_addresses(restaurant_id);

CREATE TRIGGER set_updated_at_restaurant_addresses
    BEFORE UPDATE ON restaurant_addresses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- -- Restaurant reviews
-- CREATE TABLE restaurant_reviews (
--     id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
--     restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     rating INT CHECK (rating BETWEEN 1 AND 5),
--     review_text TEXT,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

CREATE INDEX idx_reviews_restaurant_id ON restaurant_reviews(restaurant_id);

CREATE TRIGGER set_updated_at_restaurant_reviews
    BEFORE UPDATE ON restaurant_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


-- Menu items
CREATE TABLE menu_items (

    id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g. "Chicken Momo (6 pcs)", "Dal Bhat Set"
    description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    image TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE, 
    is_gluten_free BOOLEAN DEFAULT FALSE,
    spicy_level SMALLINT DEFAULT 0,         -- 0 mild, 1 medium, 2 spicy, etc.
    most_liked_rank INT,           -- e.g. 1 for most liked, 2 for second most liked
    additional_service_charge DECIMAL(5,2) DEFAULT 0.0, -- e.g. for extra cheese
    tags TEXT[],                    -- array of tags, e.g. ["Newari", "Spicy", "Set"]
    portion_size VARCHAR(50),               -- e.g. "Regular", "Large", "Family"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()

)

-- Menu item categories (Appetizers, Momo, Newari, Pizza, Thali, etc.)
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,         -- Nepali/English name: e.g. "Momo", "Juice & Drinks"
    description TEXT,
    position INT DEFAULT 0,             -- ordering in UI
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);




-- Add-on groups (Sauce, Topping, Drink, etc.)
CREATE TABLE addon_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,               -- e.g. "Sauce Addition"
    min_choices INT DEFAULT 0,                -- minimum required (e.g. 0)
    max_choices INT DEFAULT 10,               -- max allowed (e.g. 10 toppings)
    is_required BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_addon_groups_name ON addon_groups(name);


-- Add-on options (anchovies, ranch, etc.)
CREATE TABLE addon_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,               -- e.g. "Sauce Addition->Ranch,Topping Addition->Bacon"
    price DECIMAL(8,2) NOT NULL DEFAULT 0.0
);

-- Link menu item to addon groups (pizza has both sauce + topping options)
CREATE TABLE menu_item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    addon_group_id UUID NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, addon_group_id)
);


-- Tracking popularity
CREATE TABLE menu_item_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    order_count INT DEFAULT 0,
    unique_customers INT DEFAULT 0,
    reorder_count INT DEFAULT 0,                  -- how many times a repeat happened
    reorder_rate DECIMAL(5,2),                    -- (reorder_count / unique_customers) * 100

    favorite_count INT DEFAULT 0,               -- how many users favorited this item
    
    last_ordered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menu_item_stats_menu_item_id ON menu_item_stats(menu_item_id);

CREATE TRIGGER set_updated_at_menu_item_stats
    BEFORE UPDATE ON menu_item_stats
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- Favorites (user saves an item/restaurant for later)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,   -- 'restaurant' | 'menu_item'
    entity_id UUID NOT NULL,             -- restaurant.id or menu_items.id
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_favorites_entity ON favorites(entity_type, entity_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);