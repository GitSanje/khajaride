package user

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)
// User
// ------------------------------------------------------------

type CreateUserPayload struct {
	ID           *string `json:"id"`
	Email        string  `json:"email" validate:"required,email"`
	Username     string  `json:"username" validate:"required,min=3,max=50"`
	PhoneNumber  *string `json:"phoneNumber,omitempty" validate:"omitempty"` 
	Password     *string `json:"password,omitempty" validate:"omitempty,min=6"`
	Role         string `json:"role" validate:"oneof=user vendor delivery_partner admin"`
    ProfilePicture *string `json:"profilePicture,omitempty" validate:"omitempty,url"`

}


func (p *CreateUserPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------------------------------------------


type UpdateUserPayload struct {
    ID              string    `param:"id" validate:"required"`
    Email          *string    `json:"email,omitempty" validate:"omitempty,email"`
    Username       *string    `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
    PhoneNumber    *string    `json:"phoneNumber,omitempty" validate:"omitempty"`
    Password       *string    `json:"password,omitempty" validate:"omitempty,min=6"`
    Role           *string    `json:"role,omitempty" validate:"omitempty,oneof=user restaurant_manager delivery_partner admin"`
    ProfilePicture *string    `json:"profilePicture,omitempty" validate:"omitempty,url"`
}


func (p *UpdateUserPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}




// ------------------------------------------------------------


type GetUsersQuery struct {
	Page    *int    `query:"page" validate:"omitempty,min=1"`
	Limit   *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort    *string `query:"sort" validate:"omitempty,oneof=created_at updated_at email username role"`
	Order   *string `query:"order" validate:"omitempty,oneof=asc desc"`
	Search  *string `query:"search" validate:"omitempty,min=1"`
	Role    *string `query:"role" validate:"omitempty,oneof=user restaurant_manager delivery_partner admin"`
	Active  *bool   `query:"active"`
	Verified *bool  `query:"verified"`
}



func (q *GetUsersQuery) Validate() error {
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


// ------------------------------------------------------------

type GetUserByIDPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *GetUserByIDPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------------------------------------------

type DeleteUserPayload struct {
	ID uuid.UUID `param:"id" validate:"required"`
}

func (p *DeleteUserPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// User Addresses
// ------------------------------------------------------------


type CreateAddressPayload struct {
	UserId    string  `json:"userId"`
	Label     string  `json:"label" validate:"required,min=2,max=20"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	PhoneNumber string `json:"phoneNumber"`
	DetailAddressDirection string `json:"detailAddressDirection" validate:"required"`
	Latitude  float64  `json:"latitude" validate:"required"`
	Longitude float64  `json:"longitude" validate:"required"`
	IsDefault *bool    `json:"isDefault,omitempty"`
}

func (p *CreateAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ------------------------------------------------------------


type UpdateAddressPayload struct {
	ID        uuid.UUID `param:"id" validate:"required,uuid"`
	Label     *string   `json:"label" validate:"omitempty,min=2,max=20"`
	Latitude  *float64  `json:"latitude" validate:"omitempty"`
	Longitude *float64  `json:"longitude" validate:"omitempty"`
	IsDefault *bool     `json:"isDefault,omitempty"`
}

func (p *UpdateAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}



// ------------------------------------------------------------

type DeleteUserAddressPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *DeleteUserAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------------------------------------------

type GetUserAddressByIDPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *GetUserAddressByIDPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}

// ------------------------------------------------------------

type SetDefaultAddressPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *SetDefaultAddressPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------------------------------------------


type GetLoyaltyQuery struct {
	Page  *int `query:"page" validate:"omitempty,min=1"`
	Limit *int `query:"limit" validate:"omitempty,min=1,max=100"`
	TransactionType *string   `query:"transactionType" validate:"omitempty,oneof=EARN REDEEM ADJUST"`
	FromDate       *time.Time `query:"fromDate"`
	ToDate         *time.Time `query:"toDate"`
}

func (q *GetLoyaltyQuery) Validate() error {
	validate := validator.New()

	if err := validate.Struct(q); err != nil {
		return err
	}

	// Set default values
	if q.Page == nil {
		defaultPage := 1
		q.Page = &defaultPage
	}
	if q.Limit == nil {
		defaultLimit := 20
		q.Limit = &defaultLimit
	}

	return nil
}

// Redeem Points (User)
// ------------------------------------------------------------
type RedeemPointsPayload struct {
	Points float64 `json:"points" validate:"required,gt=0"` // points to redeem
	Reason string  `json:"reason" validate:"required,min=3,max=255"`
}

func (p *RedeemPointsPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}


// ------------------------------------------------------------
// Adjust Points (Admin/System)
type AdjustPointsPayload struct {
	UserID      uuid.UUID `json:"userId" validate:"required,uuid"`
	PointsChange float64   `json:"pointsChange" validate:"required"` // positive or negative
	TransactionType string `json:"transactionType" validate:"required,oneof=EARN REDEEM ADJUST"`
	Reason      string    `json:"reason" validate:"required,min=3,max=255"`
	PerformedBy string    `json:"performedBy" validate:"required"`
	ReferenceID *uuid.UUID `json:"referenceId,omitempty"`       // optional link to order/promo
	ReferenceType *string  `json:"referenceType,omitempty"`      // e.g., "ORDER", "PROMO", "MANUAL"
}   

func (p *AdjustPointsPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}





type VendorOnboardingTrackPayload  struct{
    Completed     bool `json:"completed"`
    CurrentStep   string `json:"currentStep"`
}


func (p *VendorOnboardingTrackPayload) Validate() error {
	validate := validator.New()
	return validate.Struct(p)
}




type VendorOnboardingTrackResponse  struct{
    Completed     bool `json:"completed"`
    CurrentStep   string `json:"currentStep"`
}