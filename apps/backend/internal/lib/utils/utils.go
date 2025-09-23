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

// MapClerkUserToCreateUser maps the "data" field from a Clerk webhook payload to CreateUserPayload
func MapClerkUserToCreateUser(data json.RawMessage) (*user.CreateUserPayload, error) {
	var clerkUser struct {
		ID           string  `json:"id"`
		Email        string  `json:"email"`
		Username     string  `json:"username"`
		PhoneNumber  *string `json:"phone_number"`
		ProfileImage *string `json:"profile_image_url"`
		
	}

	// Unmarshal only the data portion
	if err := json.Unmarshal(data, &clerkUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Clerk user data: %w", err)
	}

	return &user.CreateUserPayload{
		ID:             clerkUser.ID,
		Email:          clerkUser.Email,
		Username:       clerkUser.Username,
		PhoneNumber:    clerkUser.PhoneNumber,
		Password:       nil,           
		Role:           "user",        
		ProfilePicture: clerkUser.ProfileImage,
	}, nil
}
