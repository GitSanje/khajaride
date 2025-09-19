package user

import "github.com/gitSanje/khajaride/internal/model"

type User struct {
	model.Base

	Email            string  `json:"email" db:"email"`
	Username         string  `json:"username" db:"username"`
	Password         string  `json:"-" db:"password"` // omit from JSON
	PhoneNumber      *string `json:"phoneNumber,omitempty" db:"phone_number"`
	Role             string  `json:"role" db:"role"`
	IsVerified       bool    `json:"isVerified" db:"is_verified"`
	IsActive         bool    `json:"isActive" db:"is_active"`
	LoyaltyPoints    int     `json:"loyaltyPoints" db:"loyalty_points"`
	ProfilePicture   *string `json:"profilePicture,omitempty" db:"profile_picture"`
	TwoFactorEnabled bool    `json:"twoFactorEnabled" db:"two_factor_enabled"`
}
