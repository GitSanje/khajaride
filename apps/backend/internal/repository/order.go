package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/gitSanje/khajaride/internal/model/cart"
	"github.com/gitSanje/khajaride/internal/model/order"
	"github.com/gitSanje/khajaride/internal/model/payout"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/jackc/pgx/v5"
)

// ---------------- ORDER REPOSITORY ----------------

type OrderRepository struct {
	server *server.Server
}

func NewOrderRepository(s *server.Server) *OrderRepository {
	return &OrderRepository{server: s}
}

//-- ==================================================
//-- CREATE ORDER GROUP
//-- ==================================================

func (r *OrderRepository) CreateOrderGroup(ctx context.Context, tx pgx.Tx, userID string) (*order.OrderGroup, error) {

	query := `
		INSERT INTO order_groups (user_id, payment_status)
		VALUES (@userId, 'unpaid')
		RETURNING *
	`

	row, err := tx.Query(ctx, query, pgx.NamedArgs{"userId": userID})
	if err != nil {
		return nil, fmt.Errorf("failed to create order group: %w", err)
	}

	orderGroup, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderGroup])
	if err != nil {
		return nil, fmt.Errorf("failed to create order group: %w", err)
	}
	return &orderGroup, nil
}

//-- ==================================================
//-- CREATE ORDER VENDOR
//-- ==================================================
func (r *OrderRepository) CreateOrderVendor(
	ctx context.Context,
	tx pgx.Tx,
	userID string,
	vCart cart.CartVendor,
	payload *order.CreateOrderPayload,
) (*order.OrderVendor, error) {

	query := `
		INSERT INTO order_vendors (
			user_id,
			vendor_cart_id,
			vendor_id,
			subtotal,
			delivery_charge,
			vendor_service_charge,
			vat,
			vendor_discount,
			expected_delivery_time,
			delivery_instructions,
			delivery_address_id,
			payment_status,
			status
		)
		VALUES (
			@user_id,
			@vendor_cart_id,
			@vendor_id,
			@subtotal,
			COALESCE(@delivery_charge, 0),
			@vendor_service_charge,
			@vat,
			@vendor_discount,
			@expected_delivery_time,
			@delivery_instructions,
			@delivery_address_id,
			'unpaid',
			'pending'
		)
		RETURNING *
	`

	row, err := tx.Query(ctx, query, pgx.NamedArgs{
		"user_id":               userID,
		"vendor_cart_id":        vCart.ID,
		"vendor_id":             vCart.VendorID,
		"subtotal":              vCart.Subtotal,
		"delivery_charge":       vCart.DeliveryCharge,
		"vendor_service_charge": vCart.VendorServiceCharge,
		"vat":                   vCart.VAT,
		"vendor_discount":       vCart.VendorDiscount,
		"expected_delivery_time": payload.ExpectedDeliveryTime,
		"delivery_instructions": payload.DeliveryInstructions,
		"delivery_address_id":    payload.DeliveryAddressId,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create order_vendor: %w", err)
	}

	oVendor, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderVendor])
	if err != nil {
		return nil, fmt.Errorf("failed to collect new order_vendor: %w", err)
	}

	return &oVendor, nil
}



//-- ==================================================
//-- Update Order Vendor
//-- ==================================================


func (r *OrderRepository) UpdateOrderVendor(
	ctx context.Context,
	tx pgx.Tx,
	updates pgx.NamedArgs,
) (*order.OrderVendor, error) {

	query := `
		UPDATE order_vendors
		SET 
			delivery_address_id = COALESCE(@delivery_address_id, delivery_address_id),
			delivery_instructions = COALESCE(@delivery_instructions, delivery_instructions),
			subtotal = COALESCE(@subtotal, subtotal),
			vendor_discount = COALESCE(@vendor_discount, vendor_discount),
			delivery_charge = COALESCE(@delivery_charge, delivery_charge)
		WHERE id = @id
		RETURNING *
	`

	row, err := tx.Query(ctx, query, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update order_vendor: %w", err)
	}

	oVendor, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderVendor])
	if err != nil {
		return nil, fmt.Errorf("failed to collect updated order_vendor: %w", err)
	}
	return &oVendor, nil
}



//-- ==================================================
//-- GET ORDER VENDOR BY CART ID
//-- ==================================================


func (r *OrderRepository) GetOrderVendorByCartID(ctx context.Context, tx pgx.Tx, cartVendorID string) (*order.OrderVendor, error) {
	query := `SELECT * FROM order_vendors WHERE vendor_cart_id = @vendor_cart_id LIMIT 1`
	row, err := tx.Query(ctx, query, pgx.NamedArgs{"vendor_cart_id": cartVendorID})
	if err != nil {
		return nil, err
	}
	orderVendor, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderVendor])
	if err != nil {
		return nil, err
	}
	return &orderVendor, nil
}



//-- ==================================================
//-- CREATE ORDER ITEM
//-- ==================================================

func (r *OrderRepository) CreateOrderItem(
	ctx context.Context,
	tx pgx.Tx,
	orderVendorID string,
	ci cart.CartItem,
) error {

	query := `
		INSERT INTO order_items (
			order_vendor_id,
			menu_item_id,
			quantity,
			unit_price,
			discount_amount,
			special_instructions
		)
		VALUES (
			@order_vendor_id,
			@menu_item_id,
			@quantity,
			@unit_price,
			@discount_amount,
			@special_instructions
		)
	`

	_, err := tx.Exec(ctx, query, pgx.NamedArgs{
		"order_vendor_id":      orderVendorID,
		"cart_item_id":         ci.ID,
		"menu_item_id":         ci.MenuItemID,
		"quantity":             ci.Quantity,
		"unit_price":           ci.UnitPrice,
		"discount_amount":      ci.DiscountAmount,
		"special_instructions": ci.SpecialInstructions,
	})
	if err != nil {
		return fmt.Errorf("failed to create order_item: %w", err)
	}

	return nil
}
//-- ==================================================
//-- UPDATE ORDER ITEM BY order_vendor_id and menu_item_id
//-- ==================================================

func (r *OrderRepository) UpdateOrderItem(
	ctx context.Context,
	tx pgx.Tx,
	orderVendorID string,
	ci cart.CartItem,
) error {
	// 1️⃣ First, fetch the matching order item ID
	var orderItemID string
	fetchQuery := `
		SELECT id 
		FROM order_items
		WHERE order_vendor_id = @order_vendor_id
		  AND menu_item_id = @menu_item_id
		LIMIT 1
	`

	err := tx.QueryRow(ctx, fetchQuery, pgx.NamedArgs{
		"order_vendor_id": orderVendorID,
		"menu_item_id":    ci.MenuItemID,
	}).Scan(&orderItemID)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// No existing record — you can choose to return nil or insert instead
			return fmt.Errorf("no order_item found for order_vendor_id=%s and menu_item_id=%s", orderVendorID, ci.MenuItemID)
		}
		return fmt.Errorf("failed to fetch order_item id: %w", err)
	}

	// 2️⃣ Then, perform the update
	updateQuery := `
		UPDATE order_items
		SET 
			menu_item_id = COALESCE(@menu_item_id, menu_item_id),
			quantity = COALESCE(@quantity, quantity),
			unit_price = COALESCE(@unit_price, unit_price),
			discount_amount = COALESCE(@discount_amount, discount_amount),
			special_instructions = COALESCE(@special_instructions, special_instructions)
		WHERE id = @id
	`

	_, err = tx.Exec(ctx, updateQuery, pgx.NamedArgs{
		"id":                    orderItemID,
		"menu_item_id":          ci.MenuItemID,
		"quantity":              ci.Quantity,
		"unit_price":            ci.UnitPrice,
		"discount_amount":       ci.DiscountAmount,
		"special_instructions":  ci.SpecialInstructions,
	})
	if err != nil {
		return fmt.Errorf("failed to update order_item: %w", err)
	}

	return nil
}


func (r *OrderRepository) GetUserOrdersWithDetails(ctx context.Context, userId string) (*[]order.PopulatedUserOrder, error) {

	//f3619298-77dc-4704-a742-1e905273daa6
	query := `
	SELECT 
    og.*,
    jsonb_agg(
        camel(jsonb_build_object(
            'id', ov.id,
            'vendor', camel(jsonb_build_object(
                'id', v.id,
                'name', v.name,
                'img_url', v.vendor_listing_image_name,
                'rating', v.rating
            )),
            'subtotal', ov.subtotal,
            'order_items', (
                SELECT jsonb_agg(
                    camel(jsonb_build_object(
                        'id', oi.id,
                        'menu_item', camel(jsonb_build_object(
                            'id', mi.id,
                            'name', mi.name,
                            'description', mi.description
                        )),
                        'quantity', oi.quantity,
                        'unit_price', oi.unit_price
                    ))
                )
                FROM order_items oi
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_vendor_id = ov.id
            )
        ))
    ) AS vendors
	FROM order_groups og
	JOIN vendors v ON v.id = ov.vendor_id
	WHERE og.user_id = $1
	GROUP BY og.id
	ORDER BY og.created_at DESC;

	`

	rows, err := r.server.DB.Pool.Query(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	og, err := pgx.CollectRows(rows, pgx.RowToStructByName[order.PopulatedUserOrder])
	if err != nil {
		return nil, err
	}

	return &og, nil
}







func (r *OrderRepository) CreatePayout(ctx context.Context, tx pgx.Tx, p *payout.Payout) error {
	query := `
		INSERT INTO payouts (
			id,
			vendor_id,
			order_id,
			account_id,
			account_type,
			payout_type,
			method,
			amount,
			status,
			transaction_ref,
			remarks
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
		)
	`

	_, err := tx.Exec(ctx, query,
		p.ID,
		p.VendorID,
		p.OrderID,
		p.AccountID,
		p.AccountType,
		p.PayoutType,
		p.Method,
		p.Amount,
		p.Status,
		p.TransactionRef,
		p.Remarks,
	)
	if err != nil {
		return fmt.Errorf("insert payout: %w", err)
	}

	return nil
}



func (pr *OrderRepository) MarkOrderPaid(ctx context.Context,   orderID string) error {
	query := `
		UPDATE order_vendors
		SET payment_status = $1
		WHERE id = $2
	`
     _, err := pr.server.DB.Pool.Exec(ctx, query, "paid", orderID)
	if err != nil {
		return err
	}
	return nil
}