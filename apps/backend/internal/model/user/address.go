package user

import "github.com/gitSanje/khajaride/internal/model"

type UserAddress struct {
	model.Base
	
	UserID    string  `json:"userId" db:"user_id"`
	Label     string  `json:"label" db:"label"`
	Latitude  float64 `json:"latitude" db:"latitude"`
	Longitude float64 `json:"longitude" db:"longitude"`
	IsDefault bool    `json:"isDefault" db:"is_default"`

}
