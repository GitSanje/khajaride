
-- Vendor table
CREATE TABLE vendors (
    id TEXT  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
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
    opening_hours TEXT,                    
    vendor_listing_image_name TEXT,                             -- logo/banner
    vendor_logo_image_name TEXT,                             -- array of images
    vendor_type VARCHAR(50),               -- 'restaurant', 'bakery','alcohol' etc.
    favorite_count INT DEFAULT 0,   
    is_featured BOOLEAN DEFAULT FALSE,      -- for homepage
    cuisine_tags TEXT[],                    -- array of tags, e.g. ["Italian", "Pizza", "Pasta"]
    promo_text TEXT,                  -- e.g. "Free delivery on orders over $20"
    vendor_notice TEXT,                     -- e.g. "We are short-staffed today..."
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_name ON vendors(name);           -- good for search
CREATE INDEX idx_vendors_cuisine ON vendors(cuisine);     -- filter by cuisine
CREATE INDEX idx_vendors_rating ON vendors(rating);       -- for sorting/filter
CREATE INDEX idx_vendors_open ON vendors(is_open);        -- filter by availability quickly


CREATE TRIGGER set_updated_at_vendors
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- Vendor addresses
CREATE TABLE vendor_addresses (
    id TEXT  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zipcode VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- add for geographic search (delivery radius queries)
CREATE INDEX idx_vendors_location ON vendor_addresses (latitude, longitude);
CREATE INDEX idx_vendors_addresses_vendor_id ON vendor_addresses(vendor_id);
CREATE INDEX idx_vendors_addresses_city ON vendor_addresses(city);
CREATE INDEX idx_vendors_addresses_state ON vendor_addresses(state);


CREATE TRIGGER set_updated_at_vendor_addresses
    BEFORE UPDATE ON vendor_addresses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- -- Restaurant reviews
-- CREATE TABLE restaurant_reviews (
--     id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
--     restaurant_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     rating INT CHECK (rating BETWEEN 1 AND 5),
--     review_text TEXT,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE INDEX idx_reviews_restaurant_id ON restaurant_reviews(restaurant_id);

-- CREATE TRIGGER set_updated_at_restaurant_reviews
--     BEFORE UPDATE ON restaurant_reviews
--     FOR EACH ROW
--     EXECUTE FUNCTION trigger_set_updated_at();

-- Menu item categories (Appetizers, Momo, Newari, Pizza, Thali, etc.)
CREATE TABLE menu_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(150) NOT NULL,         -- Nepali/English name: e.g. "Momo", "Juice & Drinks"
    description TEXT,
    position INT DEFAULT 0,             -- ordering in UI
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Menu items
CREATE TABLE menu_items (

    id TEXT  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g. "Chicken Momo (6 pcs)", "Dal Bhat Set"
    description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    old_price DECIMAL(8,2) DEFAULT 0.0,
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
    -- special_instructions TEXT,            -- e.g. "No onions, extra spicy" during order time
    keywords TEXT,                        -- for full-text search
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_menu_items_name ON menu_items(name);
CREATE INDEX idx_menu_items_vendor ON menu_items(vendor_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_keywords ON menu_items USING GIN (to_tsvector('english', keywords));


CREATE INDEX idx_menu_items_availability ON menu_items(is_available);
CREATE INDEX idx_menu_items_popular ON menu_items(is_popular);
CREATE INDEX idx_menu_items_tags ON menu_items USING GIN (tags);   -- full-text/tag search

CREATE TRIGGER set_updated_at_menu_items
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();




CREATE TABLE vendor_menu_categories (
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, category_id)
);
CREATE UNIQUE INDEX idx_vendor_menu_categories_unique 
    ON vendor_menu_categories(vendor_id, category_id);
CREATE INDEX idx_vendor_menu_categories_category 
    ON vendor_menu_categories(category_id);
CREATE INDEX idx_vendor_menu_categories_vendor 
    ON vendor_menu_categories(vendor_id);



    
CREATE TRIGGER set_updated_at_menu_categories
    BEFORE UPDATE ON menu_categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();


-- Add-on groups (Sauce, Topping, Drink, etc.)
CREATE TABLE addon_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(100) NOT NULL,               -- e.g. "Sauce Addition"
    min_choices INT DEFAULT 0,                -- minimum required (e.g. 0)
    max_choices INT DEFAULT 10,               -- max allowed (e.g. 10 toppings)
    is_required BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_addon_groups_name ON addon_groups(name);


-- Add-on options (anchovies, ranch, etc.)
CREATE TABLE addon_options (
     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    group_id TEXT NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,               -- e.g. "Sauce Addition->Ranch,Topping Addition->Bacon"
    price DECIMAL(8,2) NOT NULL DEFAULT 0.0
);

CREATE INDEX idx_addon_options_group ON addon_options(group_id);

-- Link menu item to addon groups (pizza has both sauce + topping options)
CREATE TABLE menu_item_addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    addon_group_id TEXT NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, addon_group_id)
);


CREATE UNIQUE INDEX idx_menu_item_addons_unique 
    ON menu_item_addons(menu_item_id, addon_group_id);

CREATE INDEX idx_menu_item_addons_menu_item 
    ON menu_item_addons(menu_item_id);


-- Tracking popularity
CREATE TABLE menu_item_stats (
     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    
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

-- popular queries: "find trending dishes"
CREATE INDEX idx_menu_item_stats_ordercount ON menu_item_stats(order_count DESC);
CREATE INDEX idx_menu_item_stats_reorder_rate ON menu_item_stats(reorder_rate DESC);

CREATE TRIGGER set_updated_at_menu_item_stats
    BEFORE UPDATE ON menu_item_stats
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();



-- Favorites (user saves an item/restaurant for later)
CREATE TABLE favorites (
     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,   -- 'restaurant' | 'menu_item'
    entity_id TEXT NOT NULL,             -- restaurant.id or menu_items.id
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_favorites_entity ON favorites(entity_type, entity_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);