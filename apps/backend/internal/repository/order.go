package repository

import (
	"context"
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

	// --- 1. Check if order already exists for this CartVendor
	checkQuery := `
		SELECT * FROM order_vendors 
		WHERE vendor_cart_id = @vendor_cart_id
		LIMIT 1
	`
	row, err := tx.Query(ctx, checkQuery, pgx.NamedArgs{
		"vendor_cart_id": vCart.ID,
	})
	if err != nil && err != pgx.ErrNoRows {
		return nil, fmt.Errorf("failed to check existing order_vendor: %w", err)
	}

	existingOrder, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderVendor])
	if err == nil && existingOrder != (order.OrderVendor{}) {
		// --- 2. Check if fields have changed
		needsUpdate := false
		updateArgs := pgx.NamedArgs{
			"id": existingOrder.ID,
		}

		if *existingOrder.DeliveryAddressID != payload.DeliveryAddressId {
			updateArgs["delivery_address_id"] = payload.DeliveryAddressId
			needsUpdate = true
		}
		if existingOrder.VendorDiscount != vCart.VendorDiscount {
			updateArgs["vendor_discount"] = vCart.VendorDiscount
			needsUpdate = true
		}
		if existingOrder.Subtotal != vCart.Subtotal {
			updateArgs["subtotal"] = vCart.Subtotal
			needsUpdate = true
		}
		if *existingOrder.DeliveryInstructions != payload.DeliveryInstructions {
			updateArgs["delivery_instructions"] = payload.DeliveryInstructions
			needsUpdate = true
		}
		if vCart.DeliveryCharge != nil && existingOrder.DeliveryCharge != *vCart.DeliveryCharge {
			updateArgs["delivery_charge"] = vCart.DeliveryCharge
			needsUpdate = true
		}

		if needsUpdate {
			updateQuery := `
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
			row, err := tx.Query(ctx, updateQuery, updateArgs)
			if err != nil {
				return nil, fmt.Errorf("failed to update existing order_vendor: %w", err)
			}
			updatedOrder, err := pgx.CollectOneRow(row, pgx.RowToStructByName[order.OrderVendor])
			if err != nil {
				return nil, fmt.Errorf("failed to collect updated order_vendor: %w", err)
			}
			return &updatedOrder, nil
		}

		// If no changes, return existing
		return &existingOrder, nil
	}

	// --- 3. Create new order if not exists
	createQuery := `
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
			'paid',
			'pending'
		)
		RETURNING *
	`

	row, err = tx.Query(ctx, createQuery, pgx.NamedArgs{
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