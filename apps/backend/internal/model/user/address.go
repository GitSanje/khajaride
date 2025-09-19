package user

import "github.com/gitSanje/khajaride/internal/model"

type UserAddress struct {
	model.Base
	ID        string  `json:"id" db:"id"`
	UserID    string  `json:"userId" db:"user_id"`
	Label     string  `json:"label" db:"label"`
	Latitude  float64 `json:"latitude" db:"latitude"`
	Longitude float64 `json:"longitude" db:"longitude"`
	IsDefault bool    `json:"isDefault" db:"is_default"`

	CreatedAt string `json:"createdAt" db:"created_at"`
	UpdatedAt string `json:"updatedAt" db:"updated_at"`
}
