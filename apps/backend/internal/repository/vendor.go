package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/vendor"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// ---------------- Vendor Repository ----------------


type VendorRepository struct {
	server *server.Server
}
func NewVendorRepository(s *server.Server) *VendorRepository {
	return  &VendorRepository{server: s}
}


//-- ==================================================
//-- VENDOR
//-- ==================================================


// ---------------- Create Vendor ----------------

func (r *VendorRepository) CreateVendor(ctx context.Context, payload *vendor.CreateVendorPayload) (*vendor.Vendor, error) {
	stmt := `
		INSERT INTO vendors (
			vendor_user_id, name, about, cuisine, phone, delivery_available, pickup_available,
			 delivery_fee, min_order_amount, delivery_time_estimate,
			is_open, opening_hours, vendor_listing_image_name, vendor_logo_image_name,
			vendor_type, is_featured, cuisine_tags, promo_text, vendor_notice
		)
		VALUES (
		
			@VendorUserId, @Name, @About, @Cuisine, @Phone, @DeliveryAvailable, @PickupAvailable,
			 @DeliveryFee, @MinOrderAmount, @DeliveryTimeEstimate,
			COALESCE(@IsOpen, true), @OpeningHours, @VendorListingImage, @VendorLogoImage,
			@VendorType, COALESCE(@IsFeatured, false), @CuisineTags, @PromoText, @VendorNotice
		)
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
	    "VendorUserId":       payload.VendorUserID,
		"Name":                payload.Name,
		"About":               payload.About,
		"Cuisine":             payload.Cuisine,
		"Phone":               payload.Phone,
		"DeliveryAvailable":   payload.DeliveryAvailable,
		"PickupAvailable":     payload.PickupAvailable,
		"DeliveryFee":         payload.DeliveryFee,
		"MinOrderAmount":      payload.MinOrderAmount,
		"DeliveryTimeEstimate": payload.DeliveryTimeEstimate,
		"IsOpen":              payload.IsOpen,
		"OpeningHours":        payload.OpeningHours,
		"VendorListingImage":  payload.VendorListingImage,
		"VendorLogoImage":     payload.VendorLogoImage,
		"VendorType":          payload.VendorType,
		"IsFeatured":          payload.IsFeatured,
		"CuisineTags":         payload.CuisineTags,
		"PromoText":           payload.PromoText,
		"VendorNotice":        payload.VendorNotice,
	
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create vendor %s: %w", payload.Name, err)
	}

	createdVendor, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.Vendor])
	if err != nil {
		return nil, fmt.Errorf("failed to collect vendor row for %s: %w", payload.Name, err)
	}

	return &createdVendor, nil
}


// ---------------- Update Vendor ----------------

func (r *VendorRepository) UpdateVendor(ctx context.Context, payload *vendor.UpdateVendorPayload) (*vendor.Vendor, error) {
	stmt := `
		UPDATE vendors SET
			name = COALESCE(@Name, name),
			about = COALESCE(@About, about),
			cuisine = COALESCE(@Cuisine, cuisine),
			phone = COALESCE(@Phone, phone),
			delivery_available = COALESCE(@DeliveryAvailable, delivery_available),
			pickup_available = COALESCE(@PickupAvailable, pickup_available),
			group_order_available = COALESCE(@GroupOrderAvailable, group_order_available),
			delivery_fee = COALESCE(@DeliveryFee, delivery_fee),
			min_order_amount = COALESCE(@MinOrderAmount, min_order_amount),
			delivery_time_estimate = COALESCE(@DeliveryTimeEstimate, delivery_time_estimate),
			is_open = COALESCE(@IsOpen, is_open),
			opening_hours = COALESCE(@OpeningHours, opening_hours),
			vendor_listing_image_name = COALESCE(@VendorListingImage, vendor_listing_image_name),
			vendor_logo_image_name = COALESCE(@VendorLogoImage, vendor_logo_image_name),
			vendor_type = COALESCE(@VendorType, vendor_type),
			is_featured = COALESCE(@IsFeatured, is_featured),
			cuisine_tags = COALESCE(@CuisineTags, cuisine_tags),
			promo_text = COALESCE(@PromoText, promo_text),
			vendor_notice = COALESCE(@VendorNotice, vendor_notice),
			updated_at = NOW()
		WHERE id = @ID
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                  payload.ID,
		"Name":                payload.Name,
		"About":               payload.About,
		"Cuisine":             payload.Cuisine,
		"Phone":               payload.Phone,
		"DeliveryAvailable":   payload.DeliveryAvailable,
		"PickupAvailable":     payload.PickupAvailable,
		"GroupOrderAvailable": payload.GroupOrderAvailable,
		"DeliveryFee":         payload.DeliveryFee,
		"MinOrderAmount":      payload.MinOrderAmount,
		"DeliveryTimeEstimate": payload.DeliveryTimeEstimate,
		"IsOpen":              payload.IsOpen,
		"OpeningHours":        payload.OpeningHours,
		"VendorListingImage":  payload.VendorListingImage,
		"VendorLogoImage":     payload.VendorLogoImage,
		"VendorType":          payload.VendorType,
		"IsFeatured":          payload.IsFeatured,
		"CuisineTags":         payload.CuisineTags,
		"PromoText":           payload.PromoText,
		"VendorNotice":        payload.VendorNotice,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update vendor %s: %w", payload.ID, err)
	}

	updatedVendor, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.Vendor])
	if err != nil {
		return nil, fmt.Errorf("failed to collect vendor row for %s: %w", payload.ID, err)
	}

	return &updatedVendor, nil
}



// ---------------- Delete Vendor ----------------

func (r *VendorRepository) DeleteVendor(ctx context.Context, payload *vendor.DeleteVendorPayload) error {
	stmt := `DELETE FROM vendors WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return fmt.Errorf("failed to delete vendor %s: %w", payload.ID, err)
	}
	return nil
}


// ---------------- GET Vendors ----------------

func (r *VendorRepository) GetVendors(ctx context.Context, query *vendor.GetVendorsQuery) (*model.PaginatedResponse[vendor.Vendor], error){

	stmt := `SELECT * FROM vendors`
	args := pgx.NamedArgs{}

	conditions := []string{}

	 if query.Search != nil {
		conditions = append(conditions, "(name ILIKE @search OR about ILIKE @search OR cuisine ILIKE @search)")
		args["search"] = "%" + *query.Search + "%"
        

	 }
	 if query.Cuisine != nil {
		conditions = append(conditions, "cuisine = @cuisine")
		args["cuisine"] = *query.Cuisine
	}
	if query.IsOpen != nil {
		conditions = append(conditions, "is_open = @is_open")
		args["is_open"] = *query.IsOpen
	}
	if query.IsFeatured != nil {
		conditions = append(conditions, "is_featured = @is_featured")
		args["is_featured"] = *query.IsFeatured
	}
	if query.MinRating != nil {
		conditions = append(conditions, "rating >= @min_rating")
		args["min_rating"] = *query.MinRating
	}

	if len(conditions) > 0 {
		stmt += " WHERE " + strings.Join(conditions, " AND ")
	}

	// ----------- Count total for pagination -----------
	countStmt := "SELECT COUNT(*) FROM vendors"
	if len(conditions) > 0 {
		countStmt += " WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to get total count of vendors: %w", err)
	}

	// ----------- Sorting -----------
	sortField := "created_at"
	if query.Sort != nil {
		sortField = *query.Sort
	}
	stmt += " ORDER BY " + sortField

	if query.Order != nil && *query.Order == "desc" {
		stmt += " DESC"
	} else {
		stmt += " ASC"
	}


	// ----------- Pagination -----------
	page := 1
	limit := 10
	if query.Page != nil {
		page = *query.Page
	}
	if query.Limit != nil {
		limit = *query.Limit
	}

	stmt += " LIMIT @limit OFFSET @offset"
	args["limit"] = limit
	args["offset"] = (page - 1) * limit

	// ----------- Execute query -----------
	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get vendors query: %w", err)
	}
	defer rows.Close()

	vendors, err := pgx.CollectRows(rows, pgx.RowToStructByName[vendor.Vendor])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &model.PaginatedResponse[vendor.Vendor]{
				Data:       []vendor.Vendor{},
				Page:       page,
				Limit:      limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to collect vendors: %w", err)
	}

	return &model.PaginatedResponse[vendor.Vendor]{
		Data:       vendors,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: (total + limit - 1) / limit,
	}, nil


}
func (r *VendorRepository) GetVendorByID(ctx context.Context, payload *vendor.GetVendorByIDPayload) (*vendor.VendorPopulated, error) {
	stmt := `SELECT 
		v.*, 
		to_jsonb(va.*) AS address,
		COALESCE( 
			jsonb_agg( 
				camel(jsonb_build_object(
					'category_id', mc.id,
					'name', mc.name,
					'description', mc.description,
					'items', COALESCE(mi.menu_items, '[]'::jsonb)
              ))
			) FILTER (WHERE mc.id IS NOT NULL), '[]'::jsonb
		) AS categories
		FROM vendors v
		LEFT JOIN vendor_addresses va ON v.id = va.vendor_id
		LEFT JOIN vendor_menu_categories vmc ON vmc.vendor_id = v.id
		LEFT JOIN menu_categories mc ON mc.id = vmc.category_id
		LEFT JOIN LATERAL (
			SELECT jsonb_agg(to_jsonb(camel(mi.*))) AS menu_items
			FROM menu_items mi
			WHERE mi.category_id = mc.id AND mi.vendor_id =  @VendorID
		) mi ON true
		WHERE v.id = @VendorID
		GROUP BY v.id, va.id;

	`
	rows,err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{"VendorID": payload.ID})

    if err != nil {
		return nil, fmt.Errorf("failed to execute get vendor by id query for vendor_id=%s: %w", payload.ID, err)
	}

	vendorItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.VendorPopulated])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:vendors for vendor=%s: %w", payload.ID, err)
	}
	
	
	return &vendorItem, nil
}


func (r *VendorRepository) BulkInsertVendors(ctx context.Context, vendors []vendor.VendorBulkInput) error{
    tx, err := r.server.DB.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}


	defer tx.Rollback(ctx)

	// Prepare slices for vendors and addresses
	vendorRows := make([][]interface{}, 0, len(vendors))
	addressRows := make([][]interface{}, 0, len(vendors))

	for _, v := range vendors {
         vendorRows = append(vendorRows, []interface{}{
			v.ID,         
			v.Name,                     // name
			v.About,                    // about
			v.Rating,
			v.Cuisine,                  // cuisine
			v.DeliveryAvailable,        // delivery_available
			v.PickupAvailable,          // pickup_available
			v.DeliveryFee,              // delivery_fee
			v.MinOrderAmount,           // min_order_amount
			v.DeliveryTimeEstimate,     // delivery_time_estimate
			!v.IsOpen,          // is_open
			v.OpeningHours,             // opening_hours (JSONB)
			v.VendorListingImage,          // vendor_listing_image_name
			v.VendorLogoImage,      // vendor_logo_image_name
			v.VendorType,               // vendor_type
			v.CuisineTags,              // cuisine_tags (TEXT[])
			v.PromoText,                // promo_text
			v.VendorNotice,             // vendor_notice
		})

		addressRows = append(addressRows, []interface{}{
			uuid.New().String(),
			v.ID,
			v.Address.StreetAddress,
			v.Address.City,
			v.Address.State,
			v.Address.ZipCode,
			v.Address.Latitude,
			v.Address.Longitude,
	   })
	}

	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{"vendors"},
		[]string{
			"id",
			"name",
			"about",
			"rating",
			"cuisine",
			"delivery_available",
			"pickup_available",
			"delivery_fee",
			"min_order_amount",
			"delivery_time_estimate",
			"is_open",
			"opening_hours",
			"vendor_listing_image_name",
			"vendor_logo_image_name",
			"vendor_type",
			"cuisine_tags",
			"promo_text",
			"vendor_notice",
		},
		pgx.CopyFromRows(vendorRows),
	)
	if err != nil {
		return fmt.Errorf("failed bulk insert vendors: %w", err)
	}
	// Bulk insert vendor addresses
	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{"vendor_addresses"},
		[]string{
			"id",
			"vendor_id",
			"street_address",
			"city",
			"state",
			"zipcode",
			"latitude",
			"longitude",
		},
		pgx.CopyFromRows(addressRows),
	)
	if err != nil {
		return fmt.Errorf("failed bulk insert vendor addresses: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return  nil

}



func (r *VendorRepository) BulkInsertMenuData(
	ctx context.Context,
	categories []vendor.MenuCategory,
	items []vendor.MenuItem,
	vendorcategories []vendor.VendorCategoryLink,
) error {
	tx, err := r.server.DB.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// ------------------- BULK INSERT CATEGORIES -------------------
	if len(categories) > 0 {
		categoryRows := make([][]interface{}, 0, len(categories))
		for _, c := range categories {
			categoryRows = append(categoryRows, []interface{}{
				c.ID,
				c.Name,
				c.Description,
			})
		}

		_, err = tx.CopyFrom(
			ctx,
			pgx.Identifier{"menu_categories"},
			[]string{"id", "name", "description"},
			pgx.CopyFromRows(categoryRows),
		)
		if err != nil {
			return fmt.Errorf("failed bulk insert categories: %w", err)
		}
	}

	// ------------------- BULK INSERT MENU ITEMS -------------------
	if len(items) > 0 {
		itemRows := make([][]interface{}, 0, len(items))
		for _, i := range items {
			itemRows = append(itemRows, []interface{}{
				i.ID,
				i.Name,
				i.Description,
				i.Image,
				i.BasePrice,
				i.OldPrice,
				i.Keywords,
				i.Tags,
				i.CategoryID,
				i.VendorID,
			})
		}

		_, err = tx.CopyFrom(
			ctx,
			pgx.Identifier{"menu_items"},
			[]string{
				"id",
				"name",
				"description",
				"image",
				"base_price",
				"old_price",
				"keywords",
				"tags",
				"category_id",
				"vendor_id",
			},
			pgx.CopyFromRows(itemRows),
		)
		if err != nil {
			return fmt.Errorf("failed bulk insert menu items: %w", err)
		}
	}

	// ------------------- BULK INSERT VENDOR–CATEGORY LINKS -------------------
	if len(vendorcategories) > 0 {
		linkRows := make([][]interface{}, 0, len(vendorcategories))
		for _, vc := range vendorcategories {
			linkRows = append(linkRows, []interface{}{
				vc.VendorID,
				vc.CategoryID,
			})
		}

		_, err = tx.CopyFrom(
			ctx,
			pgx.Identifier{"vendor_menu_categories"},
			[]string{"vendor_id", "category_id"},
			pgx.CopyFromRows(linkRows),
		)
		if err != nil {
			return fmt.Errorf("failed bulk insert vendor-menu-category links: %w", err)
		}
	}

	// ------------------- COMMIT TRANSACTION -------------------
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}


//-- ==================================================
//-- VENDOR  ADDRESS
//-- ==================================================

// ---------------- Vendor Address ----------------

func (r *VendorRepository) CreateVendorAddress(ctx context.Context, payload *vendor.CreateVendorAddressPayload) (*vendor.VendorAddress, error) {
    var vendorID string
	err := r.server.DB.Pool.QueryRow(ctx, `
        SELECT id FROM vendors WHERE vendor_user_id = $1
    `, payload.VendorUserID).Scan(&vendorID)
    if err != nil {
        return nil, fmt.Errorf("failed to lookup vendor by user id: %w", err)
    }


	stmt := `
		INSERT INTO vendor_addresses (
			id, vendor_id, street_address, city, state, zipcode, latitude, longitude
		)
		VALUES (
			COALESCE(@ID, gen_random_uuid()),
			@VendorID, @StreetAddress, @City, @State, @Zipcode, @Latitude, @Longitude
		)
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":           nil,
		"VendorID":    vendorID,
		"StreetAddress": payload.StreetAddress,
		"City":         payload.City,
		"State":        payload.State,
		"Zipcode":      payload.Zipcode,
		"Latitude":     payload.Latitude,
		"Longitude":    payload.Longitude,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create vendor address: %w", err)
	}
	createdAddress, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.VendorAddress])
	if err != nil {
		return nil, fmt.Errorf("failed to collect vendor address row: %w", err)
	}

	return &createdAddress, nil
}


func (r *VendorRepository) UpdateVendorAddress(ctx context.Context, payload *vendor.UpdateVendorAddressPayload) (*vendor.VendorAddress, error) {
	stmt := `
		UPDATE vendor_addresses SET
			street_address = COALESCE(@StreetAddress, street_address),
			city = COALESCE(@City, city),
			state = COALESCE(@State, state),
			zipcode = COALESCE(@Zipcode, zipcode),
			latitude = COALESCE(@Latitude, latitude),
			longitude = COALESCE(@Longitude, longitude)
		WHERE id = @ID
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":           payload.ID,
		"StreetAddress": payload.StreetAddress,
		"City":         payload.City,
		"State":        payload.State,
		"Zipcode":      payload.Zipcode,
		"Latitude":     payload.Latitude,
		"Longitude":    payload.Longitude,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update vendor address: %w", err)
	}

	updatedAddress, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.VendorAddress])
	if err != nil {
		return nil, fmt.Errorf("failed to collect vendor address row: %w", err)
	}

	return &updatedAddress, nil
}


func (r *VendorRepository) DeleteVendorAddress(ctx context.Context, payload *vendor.DeleteVendorAddressPayload) error {
	stmt := `DELETE FROM vendor_addresses WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return fmt.Errorf("failed to delete vendor address %s: %w", payload.ID, err)
	}
	return nil
}


//-- ==================================================
//-- MENU ITEM
//-- ==================================================


func (r *VendorRepository) CreateMenuItem(ctx context.Context, payload *vendor.CreateMenuItemPayload) (*vendor.MenuItem, error) {
	stmt := `
		INSERT INTO menu_items (
			id, vendor_id, category_id, name, description, base_price, old_price,
			image, is_available, is_vegetarian, is_vegan, is_popular, is_gluten_free,
			spicy_level, most_liked_rank, additional_service_charge, tags,
			portion_size, special_instructions, keywords
		)
		VALUES (
			COALESCE(@ID, gen_random_uuid()),
			@VendorID, @CategoryID, @Name, @Description, @BasePrice, @OldPrice,
			@Image, @IsAvailable, @IsVegetarian, @IsVegan, @IsPopular, @IsGlutenFree,
			@SpicyLevel, @MostLikedRank, @AdditionalServiceCharge, @Tags,
			@PortionSize, @SpecialInstructions, @Keywords
		)
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                     nil,
		"VendorID":               payload.VendorID,
		"CategoryID":             payload.CategoryID,
		"Name":                   payload.Name,
		"Description":            payload.Description,
		"BasePrice":              payload.BasePrice,
		"OldPrice":               payload.OldPrice,
		"Image":                  payload.Image,
		"IsAvailable":            payload.IsAvailable,
		"IsVegetarian":           payload.IsVegetarian,
		"IsVegan":                payload.IsVegan,
		"IsPopular":              payload.IsPopular,
		"IsGlutenFree":           payload.IsGlutenFree,
		"SpicyLevel":             payload.SpicyLevel,
		"MostLikedRank":          payload.MostLikedRank,
		"AdditionalServiceCharge": payload.AdditionalServiceCharge,
		"Tags":                   payload.Tags,
		"PortionSize":            payload.PortionSize,
		"SpecialInstructions":    payload.SpecialInstructions,
		"Keywords":               payload.Keywords,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create menu item %s: %w", payload.Name, err)
	}

	menuItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuItem])
	if err != nil {
		return nil, fmt.Errorf("failed to collect menu item row %s: %w", payload.Name, err)
	}

	return &menuItem, nil
}


func (r *VendorRepository) UpdateMenuItem(ctx context.Context, payload *vendor.UpdateMenuItemPayload) (*vendor.MenuItem, error) {
	stmt := `
		UPDATE menu_items SET
			vendor_id = COALESCE(@VendorID, vendor_id),
			category_id = COALESCE(@CategoryID, category_id),
			name = COALESCE(@Name, name),
			description = COALESCE(@Description, description),
			base_price = COALESCE(@BasePrice, base_price),
			old_price = COALESCE(@OldPrice, old_price),
			image = COALESCE(@Image, image),
			is_available = COALESCE(@IsAvailable, is_available),
			is_vegetarian = COALESCE(@IsVegetarian, is_vegetarian),
			is_vegan = COALESCE(@IsVegan, is_vegan),
			is_popular = COALESCE(@IsPopular, is_popular),
			is_gluten_free = COALESCE(@IsGlutenFree, is_gluten_free),
			spicy_level = COALESCE(@SpicyLevel, spicy_level),
			most_liked_rank = COALESCE(@MostLikedRank, most_liked_rank),
			additional_service_charge = COALESCE(@AdditionalServiceCharge, additional_service_charge),
			tags = COALESCE(@Tags, tags),
			portion_size = COALESCE(@PortionSize, portion_size),
			special_instructions = COALESCE(@SpecialInstructions, special_instructions),
			keywords = COALESCE(@Keywords, keywords),
			updated_at = NOW()
		WHERE id = @ID
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                     payload.ID,
		"VendorID":               payload.VendorID,
		"CategoryID":             payload.CategoryID,
		"Name":                   payload.Name,
		"Description":            payload.Description,
		"BasePrice":              payload.BasePrice,
		"OldPrice":               payload.OldPrice,
		"Image":                  payload.Image,
		"IsAvailable":            payload.IsAvailable,
		"IsVegetarian":           payload.IsVegetarian,
		"IsVegan":                payload.IsVegan,
		"IsPopular":              payload.IsPopular,
		"IsGlutenFree":           payload.IsGlutenFree,
		"SpicyLevel":             payload.SpicyLevel,
		"MostLikedRank":          payload.MostLikedRank,
		"AdditionalServiceCharge": payload.AdditionalServiceCharge,
		"Tags":                   payload.Tags,
		"PortionSize":            payload.PortionSize,
		"SpecialInstructions":    payload.SpecialInstructions,
		"Keywords":               payload.Keywords,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update menu item %s: %w", payload.ID, err)
	}

	menuItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuItem])
	if err != nil {
		return nil, fmt.Errorf("failed to collect menu item row %s: %w", payload.ID, err)
	}

	return &menuItem, nil
}

// DeleteMenuItem
func (r *VendorRepository) DeleteMenuItem(ctx context.Context, payload *vendor.DeleteMenuItemPayload) error {
	stmt := `DELETE FROM menu_items WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return fmt.Errorf("failed to delete menu item %s: %w", payload.ID, err)
	}
	return nil
}

// GetMenuItemByID
func (r *VendorRepository) GetMenuItemByID(ctx context.Context, id string) (*vendor.MenuItem, error) {
	stmt := `SELECT * FROM menu_items WHERE id = @ID`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{"ID": id})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch menu item %s: %w", id, err)
	}

	item, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuItem])
	if err != nil {
		return nil, fmt.Errorf("menu item not found %s: %w", id, err)
	}

	return &item, nil
}


//-- ==================================================
//-- FAVORITE
//-- ==================================================


// CreateFavorite
func (r *VendorRepository) CreateFavorite(ctx context.Context, payload *vendor.CreateFavoritePayload) (*vendor.Favorite, error) {
	stmt := `
		INSERT INTO favorites (id, user_id, entity_type, entity_id)
		VALUES (COALESCE(@ID, gen_random_uuid()), @UserID, @EntityType, @EntityID)
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":         nil,
		"UserID":     payload.UserID,
		"EntityType": payload.EntityType,
		"EntityID":   payload.EntityID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create favorite: %w", err)
	}

	fav, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.Favorite])
	if err != nil {
		return nil, fmt.Errorf("failed to collect favorite row: %w", err)
	}

	return &fav, nil
}

// UpdateFavorite
func (r *VendorRepository) UpdateFavorite(ctx context.Context, payload *vendor.UpdateFavoritePayload) (*vendor.Favorite, error) {
	stmt := `
		UPDATE favorites SET
			user_id = COALESCE(@UserID, user_id),
			entity_type = COALESCE(@EntityType, entity_type),
			entity_id = COALESCE(@EntityID, entity_id),
			updated_at = NOW()
		WHERE id = @ID
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":         payload.ID,
		"UserID":     payload.UserID,
		"EntityType": payload.EntityType,
		"EntityID":   payload.EntityID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update favorite: %w", err)
	}

	fav, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.Favorite])
	if err != nil {
		return nil, fmt.Errorf("failed to collect favorite row: %w", err)
	}

	return &fav, nil
}

// DeleteFavorite
func (r *VendorRepository ) DeleteFavorite(ctx context.Context, payload *vendor.DeleteFavoritePayload) error {
	stmt := `DELETE FROM favorites WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return fmt.Errorf("failed to delete favorite %s: %w", payload.ID, err)
	}
	return nil
}



//-- ==================================================
//-- MENU  CATEGORY
//-- ==================================================


// CreateMenuCategory creates a new category
func (r *VendorRepository) CreateMenuCategory(ctx context.Context, payload *vendor.CreateMenuCategoryPayload) (*vendor.MenuCategory, error) {
	stmt := `
		INSERT INTO menu_categories (name, description, position)
		VALUES (@Name, @Description, COALESCE(@Position, 0))
		RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"Name":        payload.Name,
		"Description": payload.Description,
		"Position":    payload.Position,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create menu category: %w", err)
	}

	category, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuCategory])
	if err != nil {
		return nil, fmt.Errorf("failed to collect menu category row: %w", err)
	}

	return &category, nil
}

// UpdateMenuCategory updates an existing category
func (r *VendorRepository) UpdateMenuCategory(ctx context.Context, payload *vendor.UpdateMenuCategoryPayload) (*vendor.MenuCategory, error) {
	stmt := `
		UPDATE menu_categories
		SET 
			name = COALESCE(@Name, name),
			description = COALESCE(@Description, description),
			position = COALESCE(@Position, position),
			updated_at = NOW()
		WHERE id = @ID
		RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":          payload.ID,
		"Name":        payload.Name,
		"Description": payload.Description,
		"Position":    payload.Position,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update menu category %s: %w", payload.ID, err)
	}

	category, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuCategory])
	if err != nil {
		return nil, fmt.Errorf("menu category not found %s: %w", payload.ID, err)
	}

	return &category, nil
}

// DeleteMenuCategory deletes a category
func (r *VendorRepository) DeleteMenuCategory(ctx context.Context, payload *vendor.DeleteMenuCategoryPayload) error {
	stmt := `DELETE FROM menu_categories WHERE id = @ID`

	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return fmt.Errorf("failed to delete menu category %s: %w", payload.ID, err)
	}

	return nil
}

// GetMenuCategoryByID fetches a category by ID
func (r *VendorRepository) GetMenuCategoryByID(ctx context.Context, payload *vendor.GetMenuCategoryByIDPayload) (*vendor.MenuCategory, error) {
	stmt := `SELECT * FROM menu_categories WHERE id = @ID`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch menu category %s: %w", payload.ID, err)
	}

	category, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[vendor.MenuCategory])
	if err != nil {
		return nil, fmt.Errorf("menu category not found %s: %w", payload.ID, err)
	}

	return &category, nil
}


