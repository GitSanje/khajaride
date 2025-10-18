package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/cart"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/jackc/pgx/v5"
)

// ---------------- CART REPOSITORY ----------------

type CartRepository struct {
	server *server.Server
}

func NewCartRepository(s *server.Server) *CartRepository {
	return &CartRepository{server: s}
}

//-- ==================================================
//-- ADD CART ITEM
//-- ==================================================


// ------------------- UPSERT CART ITEM -------------------
func (r *CartRepository) UpsertCartItem(ctx context.Context, tx pgx.Tx,cartVendorId string, payload *cart.AddCartItemPayload) (*cart.CartItem, error) {

	var existing cart.CartItem
	checkStmt := `
		SELECT * FROM cart_items
		WHERE cart_vendor_id = @CartVendorID AND menu_item_id = @MenuItemID
		LIMIT 1
	`
	err := tx.QueryRow(ctx, checkStmt, pgx.NamedArgs{
		"CartVendorID":   cartVendorId,
		"MenuItemID": payload.MenuItemID,
	}).Scan(
		&existing.ID,
		&existing.CartVendorID,
		&existing.MenuItemID,
		&existing.Quantity,
		&existing.UnitPrice,
		&existing.DiscountAmount,
		&existing.SpecialInstructions,
		&existing.Subtotal,
		&existing.CreatedAt,
		&existing.UpdatedAt,
	)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("failed to check existing cart item: %w", err)
	}

	if errors.Is(err, pgx.ErrNoRows) {
		// 2️⃣ Item does not exist → insert
		stmt := `
		INSERT INTO cart_items (
			id, cart_vendor_id, menu_item_id, quantity, unit_price, discount_amount, special_instructions
		)
		VALUES (
			COALESCE($1, gen_random_uuid()::TEXT),
			$2, $3, $4, $5, $6, $7
		)
		RETURNING *
		`
		rows, err := tx.Query(ctx, stmt,
			nil,
			cartVendorId,
			payload.MenuItemID,
			payload.Quantity,
			payload.UnitPrice,
			payload.DiscountAmount,
			payload.SpecialInstructions,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to create cart item: %w", err)
		}
		created, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartItem])
		if err != nil {
			return nil, err
		}
		return &created, nil
	}

	// 3️⃣ Item exists → update quantity, price, discount, instructions
	updateStmt := `
		UPDATE cart_items
		SET 
			quantity = COALESCE($1, quantity),
			unit_price = COALESCE($2, unit_price),
			discount_amount = COALESCE($3, discount_amount),
			special_instructions = COALESCE($4, special_instructions)
		WHERE id = $5
		RETURNING *
	`
	rows, err := tx.Query(ctx, updateStmt,
		payload.Quantity,
		payload.UnitPrice,
		payload.DiscountAmount,
		payload.SpecialInstructions,
		existing.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update cart item: %w", err)
	}

	updated, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartItem])
	if err != nil {
		return nil, err
	}
	return &updated, nil
}




func (r *CartRepository) GetActiveCartsByUserID(ctx context.Context, userID string) ([]cart.CartItemPopulated, error) {
	var cartSessionID string

	// Get active cart session ID
	stmt1 := `SELECT id FROM cart_sessions WHERE user_id = $1 AND status = 'active' LIMIT 1`
	err := r.server.DB.Pool.QueryRow(ctx, stmt1, userID).Scan(&cartSessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active cart session: %w", err)
	}

	// Query vendors and items for that session
	stmt2 := `
	SELECT 
		cv.*,
		camel(
			jsonb_build_object(
				'vendor_id', v.id,
				'name', v.name,
				'about', v.about
			)
		) AS vendor,
		COALESCE(ci.cart_items, '[]'::jsonb) AS cart_items
	FROM cart_vendors cv
	JOIN vendors v ON v.id = cv.vendor_id
	LEFT JOIN LATERAL (
		SELECT 
			jsonb_agg(
				camel(
					jsonb_build_object(
						'cart_item', to_jsonb(ci.*),
						'menu_item', to_jsonb(mi.*)
					)
				)
			) AS cart_items
		FROM cart_items ci
		JOIN menu_items mi ON mi.id = ci.menu_item_id
		WHERE ci.cart_vendor_id = cv.id
	) ci ON TRUE
	WHERE cv.cart_session_id = @cartSessionId;
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt2, pgx.NamedArgs{"cartSessionId": cartSessionID})
	if err != nil {
		return nil, fmt.Errorf("failed to query cart vendors: %w", err)
	}
	defer rows.Close()

	// ✅ Collect all rows into a slice of CartItemPopulated
	cartItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[cart.CartItemPopulated])
	if err != nil {
		return nil, fmt.Errorf("failed to scan cart vendors: %w", err)
	}

	return cartItems, nil
}


//-- ==================================================
//-- CART SESSION
//-- ==================================================



// ------------------- GET ACTIVE CART SESSION -------------------
func (r *CartRepository) GetActiveCartSession(ctx context.Context, tx pgx.Tx, userID string) (*cart.CartSession, error) {
	stmt := `SELECT * FROM cart_sessions WHERE user_id = $1 AND status = 'active' LIMIT 1`
	row := tx.QueryRow(ctx, stmt, userID)
	var session cart.CartSession
	if err := row.Scan(
		&session.ID,
		&session.UserID,
		&session.Status,
		&session.Currency,
		&session.AppliedCouponCode,
		&session.CreatedAt,
		&session.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &session, nil
}


// ------------------- CREATE ACTIVE CART SESSION -------------------
func (r *CartRepository) CreateActiveCartSession(ctx context.Context, tx pgx.Tx, userID string) (*cart.CartSession, error) {
	stmt := `
		INSERT INTO cart_sessions (user_id, status, currency) 
		VALUES (@userId, 'active', 'NPR')
		RETURNING *
	`
	row := tx.QueryRow(ctx, stmt, pgx.NamedArgs{"userId": userID})
	var session cart.CartSession
	err := row.Scan(
		&session.ID, &session.UserID, &session.Status, &session.Currency, &session.AppliedCouponCode,
		&session.CreatedAt, &session.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// ------------------- CREATE CART SESSION -------------------

func (r *CartRepository) CreateCartSession(ctx context.Context, payload *cart.CreateCartSessionPayload) (*cart.CartSession, error) {
	stmt := `
	INSERT INTO cart_sessions (
		 user_id, currency, applied_coupon_code
	)
	VALUES (
		COALESCE(@ID, gen_random_uuid()::TEXT),
		@UserID, @Currency, @AppliedCouponCode
	)
	RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"UserID":            payload.UserID,
		"Currency":          payload.Currency,
		"AppliedCouponCode": payload.AppliedCouponCode,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create cart session: %w", err)
	}

	created, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartSession])
	if err != nil {
		return nil, err
	}
	return &created, nil
}

// ------------------- UPDATE CART SESSION -------------------

func (r *CartRepository) UpdateCartSession(ctx context.Context, payload *cart.UpdateCartSessionPayload) (*cart.CartSession, error) {
	stmt := `
	UPDATE cart_sessions
	SET status = COALESCE(@Status, status),
		currency = COALESCE(@Currency, currency),
		applied_coupon_code = COALESCE(@AppliedCouponCode, applied_coupon_code)
	WHERE id = @ID
	RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                payload.ID,
		"Status":            payload.Status,
		"Currency":          payload.Currency,
		"AppliedCouponCode": payload.AppliedCouponCode,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update cart session: %w", err)
	}

	updated, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartSession])
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// ------------------- GET CART SESSIONS -------------------

func (r *CartRepository) GetCartSessions(ctx context.Context, query *cart.GetCartSessionsQuery) (*model.PaginatedResponse[cart.CartSession], error) {
	stmt := `SELECT * FROM cart_sessions WHERE 1=1`
	args := pgx.NamedArgs{}
	conditions := []string{}

	// Filtering
	if query.UserID != nil {
		conditions = append(conditions, "user_id = @userId")
		args["userId"] = *query.UserID
	}
	if query.Status != nil {
		conditions = append(conditions, "status = @status")
		args["status"] = *query.Status
	}

	if len(conditions) > 0 {
		stmt += " AND " + strings.Join(conditions, " AND ")
	}

	// Count total for pagination
	countStmt := "SELECT COUNT(*) FROM cart_sessions WHERE 1=1"
	if len(conditions) > 0 {
		countStmt += " AND " + strings.Join(conditions, " AND ")
	}

	var total int
	if err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to get total count of cart sessions: %w", err)
	}

	// Sorting
	stmt += " ORDER BY " + *query.Sort
	if query.Order != nil && *query.Order == "desc" {
		stmt += " DESC"
	} else {
		stmt += " ASC"
	}

	// Pagination
	stmt += " LIMIT @limit OFFSET @offset"
	args["limit"] = *query.Limit
	args["offset"] = (*query.Page - 1) * (*query.Limit)

	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get cart sessions query: %w", err)
	}

	cartSessions, err := pgx.CollectRows(rows, pgx.RowToStructByName[cart.CartSession])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &model.PaginatedResponse[cart.CartSession]{
				Data:       []cart.CartSession{},
				Page:       *query.Page,
				Limit:      *query.Limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to collect cart sessions: %w", err)
	}

	return &model.PaginatedResponse[cart.CartSession]{
		Data:       cartSessions,
		Page:       *query.Page,
		Limit:      *query.Limit,
		Total:      total,
		TotalPages: (total + *query.Limit - 1) / *query.Limit,
	}, nil
}

// ------------------- DELETE CART SESSION -------------------

func (r *CartRepository) DeleteCartSession(ctx context.Context, payload *cart.DeleteCartSessionPayload) error {
	stmt := `DELETE FROM cart_sessions WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	return err
}

//-- ==================================================
//-- CART VENDOR
//-- ==================================================


// ------------------- GET CART VENDOR -------------------
func (r *CartRepository) GetCartVendor(ctx context.Context, tx pgx.Tx, sessionID, vendorID string) (*cart.CartVendor, error) {
	stmt := `SELECT * FROM cart_vendors WHERE cart_session_id = $1 AND vendor_id = $2 LIMIT 1`
	row := tx.QueryRow(ctx, stmt, sessionID, vendorID)

	var vendor cart.CartVendor
	if err := row.Scan(
		&vendor.ID,
		&vendor.CartSessionID,
		&vendor.VendorID,
		&vendor.Subtotal,
		&vendor.DeliveryCharge,
		&vendor.VendorServiceCharge,
		&vendor.VAT,
		&vendor.VendorDiscount,
		&vendor.Total,
		&vendor.CreatedAt,
		&vendor.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &vendor, nil
}



// ------------------- CREATE ACTIVE CART VENDOR -------------------
func (r *CartRepository) CreateActiveCartVendor(ctx context.Context, tx pgx.Tx, sessionID, vendorID string) (*cart.CartVendor, error) {
	stmt := `
    INSERT INTO cart_vendors (cart_session_id, vendor_id, subtotal, vendor_service_charge, vat, vendor_discount)
    VALUES ($1, $2, 0, 0, 0, 0)
    RETURNING 
      id, cart_session_id, vendor_id, subtotal, delivery_charge, vendor_service_charge, vat, vendor_discount, 
      COALESCE(total, 0) AS total, created_at, updated_at
`

	row := tx.QueryRow(ctx, stmt, sessionID, vendorID)
	var vendor cart.CartVendor
	if err := row.Scan(
		&vendor.ID,
		&vendor.CartSessionID,
		&vendor.VendorID,
		&vendor.Subtotal,
		&vendor.DeliveryCharge,
		&vendor.VendorServiceCharge,
		&vendor.VAT,
		&vendor.VendorDiscount,
		&vendor.Total,
		&vendor.CreatedAt,
		&vendor.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &vendor, nil
}

// ------------------- CREATE CART VENDOR -------------------

func (r *CartRepository) CreateCartVendor(ctx context.Context, payload *cart.CreateCartVendorPayload) (*cart.CartVendor, error) {
	stmt := `
	INSERT INTO cart_vendors (
		id, cart_session_id, vendor_id, delivery_charge, vendor_service_charge, vat, vendor_discount
	)
	VALUES (
		COALESCE(@ID, gen_random_uuid()::TEXT),
		@CartSessionID, @VendorID, @DeliveryCharge, @VendorServiceCharge, @VAT, @VendorDiscount
	)
	RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                  nil,
		"CartSessionID":       payload.CartSessionID,
		"VendorID":            payload.VendorID,
		"DeliveryCharge":      payload.DeliveryCharge,
		"VendorServiceCharge": payload.VendorServiceCharge,
		"VAT":                 payload.VAT,
		"VendorDiscount":      payload.VendorDiscount,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create cart vendor: %w", err)
	}

	created, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartVendor])
	if err != nil {
		return nil, err
	}
	return &created, nil
}

// ------------------- UPDATE CART VENDOR -------------------

func (r *CartRepository) UpdateCartVendor(ctx context.Context, payload *cart.UpdateCartVendorPayload) (*cart.CartVendor, error) {
	stmt := `
	UPDATE cart_vendors
	SET delivery_charge = COALESCE(@DeliveryCharge, delivery_charge),
		vendor_service_charge = COALESCE(@VendorServiceCharge, vendor_service_charge),
		vat = COALESCE(@VAT, vat),
		vendor_discount = COALESCE(@VendorDiscount, vendor_discount)
	WHERE id = @ID
	RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                  payload.ID,
		"DeliveryCharge":      payload.DeliveryCharge,
		"VendorServiceCharge": payload.VendorServiceCharge,
		"VAT":                 payload.VAT,
		"VendorDiscount":      payload.VendorDiscount,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update cart vendor: %w", err)
	}

	updated, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartVendor])
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// ------------------- GET CART VENDORS -------------------

func (r *CartRepository) GetCartVendors(ctx context.Context, query *cart.GetCartVendorsQuery) (*model.PaginatedResponse[cart.CartVendor], error) {
	stmt := `SELECT * FROM cart_vendors WHERE 1=1`
	args := pgx.NamedArgs{}
	conditions := []string{}

	// Filtering
	if query.CartSessionID != nil {
		conditions = append(conditions, "cart_session_id = @cartSessionId")
		args["cartSessionId"] = *query.CartSessionID
	}
	if query.VendorID != nil {
		conditions = append(conditions, "vendor_id = @vendorId")
		args["vendorId"] = *query.VendorID
	}

	if len(conditions) > 0 {
		stmt += " AND " + strings.Join(conditions, " AND ")
	}

	// Count total for pagination
	countStmt := "SELECT COUNT(*) FROM cart_vendors WHERE 1=1"
	if len(conditions) > 0 {
		countStmt += " AND " + strings.Join(conditions, " AND ")
	}

	var total int
	if err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to get total count of cart vendors: %w", err)
	}

	// Sorting
	stmt += " ORDER BY " + *query.Sort
	if query.Order != nil && *query.Order == "desc" {
		stmt += " DESC"
	} else {
		stmt += " ASC"
	}

	// Pagination
	stmt += " LIMIT @limit OFFSET @offset"
	args["limit"] = *query.Limit
	args["offset"] = (*query.Page - 1) * (*query.Limit)

	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get cart vendors query: %w", err)
	}

	cartVendors, err := pgx.CollectRows(rows, pgx.RowToStructByName[cart.CartVendor])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &model.PaginatedResponse[cart.CartVendor]{
				Data:       []cart.CartVendor{},
				Page:       *query.Page,
				Limit:      *query.Limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to collect cart vendors: %w", err)
	}

	return &model.PaginatedResponse[cart.CartVendor]{
		Data:       cartVendors,
		Page:       *query.Page,
		Limit:      *query.Limit,
		Total:      total,
		TotalPages: (total + *query.Limit - 1) / *query.Limit,
	}, nil
}

// ------------------- DELETE CART VENDOR -------------------

func (r *CartRepository) DeleteCartVendor(ctx context.Context, payload *cart.DeleteCartVendorPayload) error {
	stmt := `DELETE FROM cart_vendors WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	return err
}

//-- ==================================================
//-- CART ITEM
//-- ==================================================

// ------------------- CREATE CART ITEM -------------------

func (r *CartRepository) CreateCartItem(ctx context.Context, payload *cart.CreateCartItemPayload) (*cart.CartItem, error) {
	stmt := `
	INSERT INTO cart_items (
		id, cart_vendor_id, menu_item_id, quantity, unit_price, discount_amount, special_instructions
	)
	VALUES (
		COALESCE(@ID, gen_random_uuid()::TEXT),
		@CartVendorID, @MenuItemID, @Quantity, @UnitPrice, @DiscountAmount, @SpecialInstructions
	)
	RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                  nil,
		"CartVendorID":        payload.CartVendorID,
		"MenuItemID":          payload.MenuItemID,
		"Quantity":            payload.Quantity,
		"UnitPrice":           payload.UnitPrice,
		"DiscountAmount":      payload.DiscountAmount,
		"SpecialInstructions": payload.SpecialInstructions,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create cart item: %w", err)
	}

	created, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartItem])
	if err != nil {
		return nil, err
	}
	return &created, nil
}

// ------------------- UPDATE CART ITEM -------------------

func (r *CartRepository) UpdateCartItem(ctx context.Context, payload *cart.UpdateCartItemPayload) (*cart.CartItem, error) {
	stmt := `
	UPDATE cart_items
	SET quantity = COALESCE(@Quantity, quantity),
		unit_price = COALESCE(@UnitPrice, unit_price),
		discount_amount = COALESCE(@DiscountAmount, discount_amount),
		special_instructions = COALESCE(@SpecialInstructions, special_instructions)
	WHERE id = @ID
	RETURNING *
	`
	rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"ID":                  payload.ID,
		"Quantity":            payload.Quantity,
		"UnitPrice":           payload.UnitPrice,
		"DiscountAmount":      payload.DiscountAmount,
		"SpecialInstructions": payload.SpecialInstructions,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update cart item: %w", err)
	}

	updated, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[cart.CartItem])
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// ------------------- GET CART ITEMS -------------------

func (r *CartRepository) GetCartItems(ctx context.Context, query *cart.GetCartItemsQuery) (*model.PaginatedResponse[cart.CartItem], error) {
	stmt := `SELECT * FROM cart_items WHERE 1=1`
	args := pgx.NamedArgs{}
	conditions := []string{}

	// Filtering
	if query.CartVendorID != nil {
		conditions = append(conditions, "cart_vendor_id = @cartVendorId")
		args["cartVendorId"] = *query.CartVendorID
	}
	if query.MenuItemID != nil {
		conditions = append(conditions, "menu_item_id = @menuItemId")
		args["menuItemId"] = *query.MenuItemID
	}

	if len(conditions) > 0 {
		stmt += " AND " + strings.Join(conditions, " AND ")
	}

	// Count total for pagination
	countStmt := "SELECT COUNT(*) FROM cart_items WHERE 1=1"
	if len(conditions) > 0 {
		countStmt += " AND " + strings.Join(conditions, " AND ")
	}

	var total int
	if err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to get total count of cart items: %w", err)
	}

	// Sorting
	stmt += " ORDER BY " + *query.Sort
	if query.Order != nil && *query.Order == "desc" {
		stmt += " DESC"
	} else {
		stmt += " ASC"
	}

	// Pagination
	stmt += " LIMIT @limit OFFSET @offset"
	args["limit"] = *query.Limit
	args["offset"] = (*query.Page - 1) * (*query.Limit)

	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get cart items query: %w", err)
	}

	cartItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[cart.CartItem])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &model.PaginatedResponse[cart.CartItem]{
				Data:       []cart.CartItem{},
				Page:       *query.Page,
				Limit:      *query.Limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to collect cart items: %w", err)
	}

	return &model.PaginatedResponse[cart.CartItem]{
		Data:       cartItems,
		Page:       *query.Page,
		Limit:      *query.Limit,
		Total:      total,
		TotalPages: (total + *query.Limit - 1) / *query.Limit,
	}, nil
}

// ------------------- DELETE CART ITEM -------------------
func (r *CartRepository) DeleteCartItem(ctx context.Context, payload *cart.DeleteCartItemPayload) error {
	stmt := `DELETE FROM cart_items WHERE id = @ID`
	_, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
	return err
}
