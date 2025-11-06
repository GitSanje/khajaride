package vendor

import (
	"github.com/go-playground/validator/v10"
	
)

// ------------------------- Vendor -------------------------

type OpeningHours map[string]string // e.g. {"mon": "09-22", "tue": "09-22"}

type CreateVendorPayload struct {
	Name                  string   `json:"name" validate:"required,min=3,max=150"`
	About                 string  `json:"about"`
	Cuisine               string  `json:"cuisine"`
	VendorUserID          string  `json:"vendorUserId" validate:"required" `
	Phone                 string  `json:"phone"`
	DeliveryAvailable     bool    `json:"deliveryAvailable,omitempty"`
	PickupAvailable       bool    `json:"pickupAvailable,omitempty"`
	DeliveryFee           *float64 `json:"deliveryFee,omitempty" validate:"omitempty,min=0"`
	MinOrderAmount        *float64 `json:"minOrderAmount,omitempty" validate:"omitempty,min=0"`
	DeliveryTimeEstimate  *string  `json:"deliveryTimeEstimate,omitempty"`
	IsOpen                *bool    `json:"isOpen,omitempty"`
	OpeningHours           string  `json:"openingHours"`
	VendorListingImage    *string  `json:"vendorListingImage,omitempty"`
	VendorLogoImage       *string  `json:"vendorLogoImage,omitempty"`
	VendorType             string  `json:"vendorType" validate:"oneof=restaurant bakery alcohol cafe"`
	IsFeatured            *bool    `json:"isFeatured,omitempty"`
	CuisineTags           []string `json:"cuisineTags,omitempty"`
	PromoText             *string  `json:"promoText,omitempty"`
	VendorNotice          *string  `json:"vendorNotice,omitempty"`
}

func (p *CreateVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


type UpdateVendorPayload struct {
	ID                    string        `json:"id" validate:"required,uuid4"`
	Name                  *string       `json:"name,omitempty" validate:"omitempty,min=3,max=150"`
	About                 *string       `json:"about,omitempty"`
	Cuisine               *string       `json:"cuisine,omitempty"`
	Phone                 *string       `json:"phone,omitempty"`
	DeliveryAvailable     *bool         `json:"deliveryAvailable,omitempty"`
	PickupAvailable       *bool         `json:"pickupAvailable,omitempty"`
	GroupOrderAvailable   *bool         `json:"groupOrderAvailable,omitempty"`
	DeliveryFee           *float64      `json:"deliveryFee,omitempty" validate:"omitempty,min=0"`
	MinOrderAmount        *float64      `json:"minOrderAmount,omitempty" validate:"omitempty,min=0"`
	DeliveryTimeEstimate  *string       `json:"deliveryTimeEstimate,omitempty"`
	IsOpen                *bool         `json:"isOpen,omitempty"`
	OpeningHours          *OpeningHours `json:"openingHours,omitempty"`
	VendorListingImage    *string       `json:"vendorListingImageName,omitempty"`
	VendorLogoImage       *string       `json:"vendorLogoImageName,omitempty"`
	VendorType            *string       `json:"vendorType,omitempty" validate:"omitempty,oneof=restaurant bakery alcohol cafe"`
	IsFeatured            *bool         `json:"isFeatured,omitempty"`
	CuisineTags           []string      `json:"cuisineTags,omitempty"`
	PromoText             *string       `json:"promoText,omitempty"`
	VendorNotice          *string       `json:"vendorNotice,omitempty"`
}

func (p *UpdateVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteVendorPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteVendorPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


type GetVendorsQuery struct {
	Page       *int     `query:"page" validate:"omitempty,min=1"`
	Limit      *int     `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort       *string  `query:"sort" validate:"omitempty,oneof=created_at updated_at rating name"`
	Order      *string  `query:"order" validate:"omitempty,oneof=asc desc"`
	Search     *string  `query:"search" validate:"omitempty,min=2"`
	Cuisine    *string  `query:"cuisine" validate:"omitempty"`
	IsOpen     *bool    `query:"is_open"`
	IsFeatured *bool    `query:"is_featured"`
	MinRating  *float64 `query:"min_rating" validate:"omitempty,min=0,max=5"`
}

func (q *GetVendorsQuery) Validate() error {
	validate := validator.New()
	if err := validate.Struct(q); err != nil {
		return err
	}

	// Set defaults if nil
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

type GetVendorByIDPayload struct {
	ID string`param:"id" validate:"required"`
}

func (p *GetVendorByIDPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------- Vendor Address -------------------------

type CreateVendorAddressPayload struct {
	VendorUserID  string   `json:"vendorUserId" validate:"required"`
	StreetAddress *string  `json:"streetAddress,omitempty"`
	City          string  `json:"city"`
	State         string  `json:"state"`
	Zipcode       string  `json:"zipcode"`
	Latitude      float64 `json:"latitude" validate:"required"`
	Longitude     float64 `json:"longitude" validate:"required"`
}

func (p *CreateVendorAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type UpdateVendorAddressPayload struct {
	ID            string   `json:"id" validate:"required,uuid4"`
	StreetAddress *string  `json:"streetAddress,omitempty"`
	City          *string  `json:"city,omitempty"`
	State         *string  `json:"state,omitempty"`
	Zipcode       *string  `json:"zipcode,omitempty"`
	Latitude      *float64 `json:"latitude,omitempty"`
	Longitude     *float64 `json:"longitude,omitempty"`
}

func (p *UpdateVendorAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteVendorAddressPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteVendorAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------- Menu Item -------------------------


type CreateMenuItemPayload struct {
	VendorID                string   `json:"vendorId" validate:"required,uuid4"`
	CategoryID              string   `json:"categoryId" validate:"required,uuid4"`
	Name                    string   `json:"name" validate:"required,min=2,max=150"`
	Description             *string  `json:"description,omitempty"`
	BasePrice               float64  `json:"basePrice" validate:"required,min=0"`
	OldPrice                *float64 `json:"oldPrice,omitempty" validate:"omitempty,min=0"`
	Image                   *string  `json:"image,omitempty"`
	IsAvailable             *bool    `json:"isAvailable,omitempty"`
	IsVegetarian            *bool    `json:"isVegetarian,omitempty"`
	IsVegan                 *bool    `json:"isVegan,omitempty"`
	IsPopular               *bool    `json:"isPopular,omitempty"`
	IsGlutenFree            *bool    `json:"isGlutenFree,omitempty"`
	SpicyLevel              *int     `json:"spicyLevel,omitempty" validate:"omitempty,min=0,max=5"`
	MostLikedRank           *int     `json:"mostLikedRank,omitempty"`
	AdditionalServiceCharge  *float64 `json:"additionalServiceCharge,omitempty" validate:"omitempty,min=0"`
	Tags                    []string `json:"tags,omitempty"`
	PortionSize             *string  `json:"portionSize,omitempty"`
	SpecialInstructions     *string  `json:"specialInstructions,omitempty"`
	Keywords                *string  `json:"keywords,omitempty"`
}

func (p *CreateMenuItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type UpdateMenuItemPayload struct {
	ID                     string   `json:"id" validate:"required,uuid4"`
	VendorID               *string  `json:"vendorId,omitempty" validate:"omitempty,uuid4"`
	CategoryID             *string  `json:"categoryId,omitempty" validate:"omitempty,uuid4"`
	Name                   *string  `json:"name,omitempty" validate:"omitempty,min=2,max=150"`
	Description            *string  `json:"description,omitempty"`
	BasePrice              *float64 `json:"basePrice,omitempty" validate:"omitempty,min=0"`
	OldPrice               *float64 `json:"oldPrice,omitempty" validate:"omitempty,min=0"`
	Image                  *string  `json:"image,omitempty"`
	IsAvailable            *bool    `json:"isAvailable,omitempty"`
	IsVegetarian           *bool    `json:"isVegetarian,omitempty"`
	IsVegan                *bool    `json:"isVegan,omitempty"`
	IsPopular              *bool    `json:"isPopular,omitempty"`
	IsGlutenFree           *bool    `json:"isGlutenFree,omitempty"`
	SpicyLevel             *int     `json:"spicyLevel,omitempty" validate:"omitempty,min=0,max=5"`
	MostLikedRank          *int     `json:"mostLikedRank,omitempty"`
	AdditionalServiceCharge *float64 `json:"additionalServiceCharge,omitempty" validate:"omitempty,min=0"`
	Tags                   []string `json:"tags,omitempty"`
	PortionSize            *string  `json:"portionSize,omitempty"`
	SpecialInstructions    *string  `json:"specialInstructions,omitempty"`
	Keywords               *string  `json:"keywords,omitempty"`
}

func (p *UpdateMenuItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type GetMenuItemsQuery struct {
	Page        *int    `query:"page" validate:"omitempty,min=1"`
	Limit       *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Search      *string `query:"search" validate:"omitempty,min=2"`
	Sort        *string `query:"sort" validate:"omitempty,oneof=created_at updated_at name base_price rating"`
	Order       *string `query:"order" validate:"omitempty,oneof=asc desc"`
	Tag         *string `query:"tag,omitempty"`
	Category    *string `query:"category,omitempty"`
	VendorID    *string `query:"vendorId,omitempty,uuid4"`
	IsAvailable *bool   `query:"isAvailable,omitempty"`
	IsPopular   *bool   `query:"isPopular,omitempty"`
}


func (q *GetMenuItemsQuery) Validate() error {
	validate := validator.New()

	if err := validate.Struct(q); err != nil {
		return err
	}

	// Set default pagination values
	if q.Page == nil {
		defaultPage := 1
		q.Page = &defaultPage
	}
	if q.Limit == nil {
		defaultLimit := 20
		q.Limit = &defaultLimit
	}
	// Set default sort and order
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



type DeleteMenuItemPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteMenuItemPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ---------------- Menu Category ----------------

type CreateMenuCategoryPayload struct {

	Name        string  `json:"name" validate:"required,min=2,max=100"`
	Description *string `json:"description,omitempty"`
	Position    *int    `json:"position,omitempty"`
}

func (p *CreateMenuCategoryPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type UpdateMenuCategoryPayload struct {
	ID          string  `json:"id" validate:"required,uuid4"`
	Name        *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description,omitempty"`
	Position    *int    `json:"position,omitempty"`
}

func (p *UpdateMenuCategoryPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteMenuCategoryPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteMenuCategoryPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type GetMenuCategoryByIDPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *GetMenuCategoryByIDPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}




// ------------------------- Addon Group / Option -------------------------


type CreateAddonGroupPayload struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	MinChoices  *int   `json:"minChoices,omitempty" validate:"omitempty,min=0"`
	MaxChoices  *int   `json:"maxChoices,omitempty" validate:"omitempty,min=0"`
	IsRequired  *bool  `json:"isRequired,omitempty"`
}

func (p *CreateAddonGroupPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type CreateAddonOptionPayload struct {
	GroupID string  `json:"groupId" validate:"required,uuid4"`
	Name    string  `json:"name" validate:"required,min=2,max=100"`
	Price   float64 `json:"price" validate:"required,min=0"`
}

func (p *CreateAddonOptionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



type UpdateAddonGroupPayload struct {
	ID         string  `json:"id" validate:"required,uuid4"`
	Name       *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	MinChoices *int    `json:"minChoices,omitempty" validate:"omitempty,min=0"`
	MaxChoices *int    `json:"maxChoices,omitempty" validate:"omitempty,min=0"`
	IsRequired *bool   `json:"isRequired,omitempty"`
}

func (p *UpdateAddonGroupPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteAddonGroupPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteAddonGroupPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type UpdateAddonOptionPayload struct {
	ID      string   `json:"id" validate:"required,uuid4"`
	GroupID *string  `json:"groupId,omitempty" validate:"omitempty,uuid4"`
	Name    *string  `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Price   *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
}

func (p *UpdateAddonOptionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteAddonOptionPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteAddonOptionPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



// ------------------------- Menu Item Addon -------------------------

type CreateMenuItemAddonPayload struct {
	MenuItemID   string `json:"menuItemId" validate:"required,uuid4"`
	AddonGroupID string `json:"addonGroupId" validate:"required,uuid4"`
}

func (p *CreateMenuItemAddonPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type UpdateMenuItemAddonPayload struct {
	ID           string  `json:"id" validate:"required,uuid4"`
	MenuItemID   *string `json:"menuItemId,omitempty" validate:"omitempty,uuid4"`
	AddonGroupID *string `json:"addonGroupId,omitempty" validate:"omitempty,uuid4"`
}

func (p *UpdateMenuItemAddonPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteMenuItemAddonPayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteMenuItemAddonPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



// ------------------------- Favorite -------------------------

type CreateFavoritePayload struct {
	UserID     string `json:"userId" validate:"required"`
	EntityType string `json:"entityType" validate:"required,oneof=restaurant menu_item"`
	EntityID   string `json:"entityId" validate:"required,uuid4"`
}

func (p *CreateFavoritePayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


type UpdateFavoritePayload struct {
	ID         string  `json:"id" validate:"required,uuid4"`
	UserID     *string `json:"userId,omitempty"`
	EntityType *string `json:"entityType,omitempty" validate:"omitempty,oneof=restaurant menu_item"`
	EntityID   *string `json:"entityId,omitempty" validate:"omitempty,uuid4"`
}

func (p *UpdateFavoritePayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

type DeleteFavoritePayload struct {
	ID string `param:"id" validate:"required,uuid4"`
}

func (p *DeleteFavoritePayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


type UploadImagesResponse struct {
	UploadedURLs []string `json:"uploadedURLs" `
}