package cart

import "github.com/go-playground/validator/v10"

//-- ==================================================
//-- CART SESSION
//-- ==================================================

// ----------------- Create -----------------
type CreateCartSessionPayload struct {
	UserID           string  `json:"userId" validate:"required"`
	Currency         *string `json:"currency,omitempty"`
	AppliedCouponCode *string `json:"appliedCouponCode,omitempty"`
}

func (p *CreateCartSessionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Update -----------------
type UpdateCartSessionPayload struct {
	ID               string `json:"id" validate:"required"`
	Status           *string `json:"status,omitempty" validate:"omitempty,oneof=active checked_out abandoned"`
	Currency         *string `json:"currency,omitempty"`
	AppliedCouponCode *string `json:"appliedCouponCode,omitempty"`
}

func (p *UpdateCartSessionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Query -----------------
type GetCartSessionsQuery struct {
	Page    *int    `query:"page" validate:"omitempty,min=1"`
	Limit   *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort    *string `query:"sort" validate:"omitempty,oneof=created_at updated_at status currency"`
	Order   *string `query:"order" validate:"omitempty,oneof=asc desc"`
	UserID  *string `query:"userId" validate:"omitempty"`
	Status  *string `query:"status" validate:"omitempty,oneof=active checked_out abandoned"`
}

func (q *GetCartSessionsQuery) Validate() error {
	validate := validator.New()
	if err := validate.Struct(q); err != nil {
		return err
	}
	// defaults
	if q.Page == nil {
		defaultPage := 1
		q.Page = &defaultPage
	}
	if q.Limit == nil {
		defaultLimit := 20
		q.Limit = &defaultLimit
	}
	if q.Sort == nil {
		defaultSort := "created_at"
		q.Sort = &defaultSort
	}
	if q.Order == nil {
		defaultOrder := "desc"
		q.Order = &defaultOrder
	}
	return nil
}

// ----------------- Delete -----------------
type DeleteCartSessionPayload struct {
	ID string `param:"id" validate:"required"`
}

func (p *DeleteCartSessionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


//-- ==================================================
//-- CART VENDOR
//-- ==================================================


// ----------------- Create -----------------
type CreateCartVendorPayload struct {
	CartSessionID       string   `json:"cartSessionId" validate:"required"`
	VendorID            string   `json:"vendorId" validate:"required"`
	DeliveryCharge      *float64 `json:"deliveryCharge,omitempty" validate:"omitempty,min=0"`
	VendorServiceCharge *float64 `json:"vendorServiceCharge,omitempty" validate:"omitempty,min=0"`
	VAT                 *float64 `json:"vat,omitempty" validate:"omitempty,min=0"`
	VendorDiscount      *float64 `json:"vendorDiscount,omitempty" validate:"omitempty,min=0"`
}

func (p *CreateCartVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Update -----------------
type UpdateCartVendorPayload struct {
	DeliveryCharge      *float64 `json:"deliveryCharge,omitempty" validate:"omitempty,min=0"`
	VendorServiceCharge *float64 `json:"vendorServiceCharge,omitempty" validate:"omitempty,min=0"`
	VAT                 *float64 `json:"vat,omitempty" validate:"omitempty,min=0"`
	VendorDiscount      *float64 `json:"vendorDiscount,omitempty" validate:"omitempty,min=0"`
}

func (p *UpdateCartVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Query -----------------
type GetCartVendorsQuery struct {
	Page          *int    `query:"page" validate:"omitempty,min=1"`
	Limit         *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort          *string `query:"sort" validate:"omitempty,oneof=created_at updated_at subtotal total vendor_id"`
	Order         *string `query:"order" validate:"omitempty,oneof=asc desc"`
	CartSessionID *string `query:"cartSessionId" validate:"omitempty"`
	VendorID      *string `query:"vendorId" validate:"omitempty"`
}

func (q *GetCartVendorsQuery) Validate() error {
	validate := validator.New()
	if err := validate.Struct(q); err != nil {
		return err
	}
	// defaults
	if q.Page == nil {
		defaultPage := 1
		q.Page = &defaultPage
	}
	if q.Limit == nil {
		defaultLimit := 20
		q.Limit = &defaultLimit
	}
	if q.Sort == nil {
		defaultSort := "created_at"
		q.Sort = &defaultSort
	}
	if q.Order == nil {
		defaultOrder := "desc"
		q.Order = &defaultOrder
	}
	return nil
}

// ----------------- Delete -----------------
type DeleteCartVendorPayload struct {
	ID string `param:"id" validate:"required"`
}


func (p *DeleteCartVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



//-- ==================================================
//-- CART ITEM
//-- ==================================================



// ----------------- Create -----------------
type CreateCartItemPayload struct {
	CartVendorID        string   `json:"cartVendorId" validate:"required,uuid4"`
	MenuItemID          string   `json:"menuItemId" validate:"required,uuid4"`
	Quantity            int      `json:"quantity" validate:"required,min=1"`
	UnitPrice           float64  `json:"unitPrice" validate:"required,min=0"`
	DiscountAmount      *float64 `json:"discountAmount,omitempty" validate:"omitempty,min=0"`
	SpecialInstructions *string  `json:"specialInstructions,omitempty"`
}

func (p *CreateCartItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Update -----------------
type UpdateCartItemPayload struct {
	Quantity            *int     `json:"quantity,omitempty" validate:"omitempty,min=1"`
	UnitPrice           *float64 `json:"unitPrice,omitempty" validate:"omitempty,min=0"`
	DiscountAmount      *float64 `json:"discountAmount,omitempty" validate:"omitempty,min=0"`
	SpecialInstructions *string  `json:"specialInstructions,omitempty"`
}

func (p *UpdateCartItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ----------------- Query -----------------
type GetCartItemsQuery struct {
	Page         *int    `query:"page" validate:"omitempty,min=1"`
	Limit        *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort         *string `query:"sort" validate:"omitempty,oneof=created_at updated_at quantity subtotal"`
	Order        *string `query:"order" validate:"omitempty,oneof=asc desc"`
	CartVendorID *string `query:"cartVendorId" validate:"omitempty"`
	MenuItemID   *string `query:"menuItemId" validate:"omitempty"`
}

func (q *GetCartItemsQuery) Validate() error {
	validate := validator.New()
	if err := validate.Struct(q); err != nil {
		return err
	}
	// defaults
	if q.Page == nil {
		defaultPage := 1
		q.Page = &defaultPage
	}
	if q.Limit == nil {
		defaultLimit := 20
		q.Limit = &defaultLimit
	}
	if q.Sort == nil {
		defaultSort := "created_at"
		q.Sort = &defaultSort
	}
	if q.Order == nil {
		defaultOrder := "desc"
		q.Order = &defaultOrder
	}
	return nil
}

// ----------------- Delete -----------------
type DeleteCartItemPayload struct {
	ID string `json:"param" validate:"required"`
}

func (p *DeleteCartItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}