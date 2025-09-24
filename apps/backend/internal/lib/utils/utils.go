package utils

import (
	"encoding/json"
	"fmt"
	
	"github.com/gitSanje/khajaride/internal/model/user"
)

func PrintJSON(v interface{}) {
	json, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Println("Error marshalling to JSON:", err)
		return
	}
	fmt.Println("JSON:", string(json))
}

// ---------- Interfaces & Structs ----------
type HasValue interface {
	GetValue() string
	GetID() string
}

type ClerkEmail struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
}

func (c ClerkEmail) GetValue() string { return c.EmailAddress }
func (c ClerkEmail) GetID() string    { return c.ID }

type ClerkPhoneNumber struct {
	ID          string `json:"id"`
	PhoneNumber string `json:"phone_number"`
}

func (c ClerkPhoneNumber) GetValue() string { return c.PhoneNumber }
func (c ClerkPhoneNumber) GetID() string    { return c.ID }


func strPtr(s string) *string {
	if s == "" {
		return nil 
	}
	return &s
}


// ---------- Generic Helper ----------
func findPrimaryValue[T HasValue](data []T, primaryID string) string {
	for _, item := range data {
		if item.GetID() == primaryID {
			return item.GetValue()
		}
	}
	return ""
}
// MapClerkUserToCreateUser maps the "data" field from a Clerk webhook payload to CreateUserPayload
func MapClerkUserToCreateUser(data json.RawMessage) (*user.CreateUserPayload, error) {
	
	var clerkUser struct {
		ID           *string  `json:"id"`
		EmailAddresses        []ClerkEmail `json:"email_addresses"`
		PhoneNumbers  []ClerkPhoneNumber `json:"phone_numbers"`
		ProfileImage *string `json:"image_url"`
		Username     string  `json:"username"`
		PrimaryEmailAddressID string       `json:"primary_email_address_id"`
		PrimaryPhoneNumberID   string       `json:"primary_phone_number_id"`
	}

	// Unmarshal only the data portion
	if err := json.Unmarshal(data, &clerkUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Clerk user data: %w", err)
	}

	email := findPrimaryValue(clerkUser.EmailAddresses, clerkUser.PrimaryEmailAddressID)
	phoneNumber := findPrimaryValue(clerkUser.PhoneNumbers, clerkUser.PrimaryPhoneNumberID)
    
	return &user.CreateUserPayload{
		ID:             clerkUser.ID,
		Email:          email,
		Username:       clerkUser.Username,
		PhoneNumber:    strPtr(phoneNumber),
		Password:       nil,
		Role:           "user",
		ProfilePicture: clerkUser.ProfileImage,
	}, nil
}
