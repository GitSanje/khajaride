package service

import (
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)


type UserService struct {
	
	server *server.Server
	userRepo *repository.UserRepository
}

func NewUserService(s *server.Server, userRepo *repository.UserRepository) *UserService {
	return &UserService{
		server:  s,
		userRepo: userRepo,
	}
}

func (s *UserService) GetVendorOnboardingTrack(ctx echo.Context, userID string) (*user.VendorOnboardingTrackResponse, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().
        Str("user_id", userID).
        Msg("Checking vendor onboarding status")

    onboardingtrack, err := s.userRepo.GetVendorOnboardingTrack(ctx.Request().Context(), userID)
    if err != nil {
        logger.Error().
            Err(err).
            Str("user_id", userID).
            Msg("Failed to fetch vendor onboarding status")
        return nil, err
    }

    logger.Info().
        Str("user_id", userID).
        Bool("isVendorOnboardingCompleted", onboardingtrack.Completed).
        Msg("Fetched vendor onboarding status successfully")

    return onboardingtrack, nil
}


func (s *UserService) VendorOnboardingTrack(ctx echo.Context,userID string, payload *user.VendorOnboardingTrackPayload) (*user.VendorOnboardingTrackResponse, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().
        Str("user_id", userID).
        Msg("Checking vendor onboarding status")

    onboardingtrack, err := s.userRepo.VendorOnboardingTrack(ctx.Request().Context(), userID, payload)
    if err != nil {
        logger.Error().
            Err(err).
            Str("user_id", userID).
            Msg("Failed to fetch vendor onboarding status")
        return nil, err
    }

    logger.Info().
        Str("user_id", userID).
        Bool("isVendorOnboardingCompleted", onboardingtrack.Completed).
        Msg("Fetched vendor onboarding status successfully")

    return onboardingtrack, nil
}


func ( s *UserService) CreateUser ( ctx echo.Context,  payload *user.CreateUserPayload) ( *user.User, error) {
	logger := middleware.GetLogger(ctx)

	 logger.Info().
        Str("email", payload.Email).
        Str("username", payload.Username).
        Msg("Starting user creation")
	
	createdUser, err := s.userRepo.CreateUser(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().
            Err(err).
            Str("email", payload.Email).
            Msg("Failed to create user in repository")
        return nil, err
    }

	 logger.Info().
        Str("event", "user_created").
        Str("user_id", createdUser.ID).
        Str("email", createdUser.Email).
        Str("username", createdUser.Username).
        Str("role", createdUser.Role).
        Msg("User created successfully")

    return createdUser, nil

}


func (s *UserService) GetUserByID(ctx echo.Context, userID string) (*user.User, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID).Msg("Fetching user by ID")

    u, err := s.userRepo.GetUserByID(ctx.Request().Context(), userID)
    if err != nil {
        logger.Error().Err(err).Str("user_id", userID).Msg("Failed to fetch user by ID")
        return nil, err
    }

    logger.Info().Str("user_id", userID).Msg("User fetched successfully")
    return u, nil
}


func (s *UserService) UpdateUser(ctx echo.Context, userID string, payload *user.UpdateUserPayload) (*user.User, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID).Msg("Updating user")

    updatedUser, err := s.userRepo.UpdateUser(ctx.Request().Context(), userID, payload)
    if err != nil {
        logger.Error().Err(err).Str("user_id", userID).Msg("Failed to update user")
        return nil, err
    }

    logger.Info().
        Str("user_id", updatedUser.ID).
        Str("email", updatedUser.Email).
        Str("username", updatedUser.Username).
        Msg("User updated successfully")

    return updatedUser, nil
}


func (s *UserService) GetUsers(ctx echo.Context, query *user.GetUsersQuery) (*model.PaginatedResponse[user.User], error) {
    logger := middleware.GetLogger(ctx)

    // Validate the query parameters
    if err := query.Validate(); err != nil {
        logger.Warn().Err(err).Msg("Invalid GetUsers query parameters")
        return nil, err
    }

    logger.Info().
        Msg("Fetching users with filters")

    // Call repository to fetch users
    usersPage, err := s.userRepo.GetUsers(ctx.Request().Context(), query)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch users from repository")
        return nil, err
    }

    logger.Info().
        Int("page", usersPage.Page).
        Int("limit", usersPage.Limit).
        Int("total", usersPage.Total).
        Int("totalPages", usersPage.TotalPages).
        Msg("Users fetched successfully")

    return usersPage, nil
}


func (s *UserService) DeleteUser(ctx echo.Context, userID string) error {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID).Msg("Deleting user")

    if err := s.userRepo.DeleteUser(ctx.Request().Context(), userID); err != nil {
        logger.Error().Err(err).Str("user_id", userID).Msg("Failed to delete user")
        return err
    }

    logger.Info().Str("user_id", userID).Msg("User deleted successfully")
    return nil
}



func (s *UserService) CreateAddress(ctx echo.Context, userID string, payload *user.CreateAddressPayload) (*user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)

    // Validate payload
    if err := payload.Validate(); err != nil {
        logger.Warn().Err(err).Msg("Invalid CreateAddress payload")
        return nil, err
    }

    logger.Info().Str("user_id", userID).Msg("Creating new address")

    // Call repository
    address, err := s.userRepo.CreateAddress(ctx.Request().Context(), userID, payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to create address")
        return nil, err
    }

    logger.Info().Str("address_id", address.ID).Msg("Address created successfully")
    return address, nil
}


func (s *UserService) GetUserAddressByID(ctx echo.Context, payload *user.GetUserAddressByIDPayload) (*user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)

  
    u, err := s.userRepo.GetUserAddressByID(ctx.Request().Context(), payload.ID.String())
    if err != nil {
        logger.Error().Err(err).Str("address_id", payload.ID.String()).Msg("Failed to fetch user address by ID")
        return nil, err
    }

    logger.Info().Str("address_id", payload.ID.String()).Msg("User address fetched successfully")
    return u, nil
}


func (s *UserService) GetUserAddressByUserID(ctx echo.Context, userID string) ([]user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)


    u, err := s.userRepo.GetUserAddressesByUserID(ctx.Request().Context(), userID)
    if err != nil {
        logger.Error().Err(err).Str("user_id", userID).Msg("Failed to fetch user addresses by user ID")
        return nil, err
    }

    logger.Info().Str("user_id", userID).Msg("User addresses fetched successfully")
    return u, nil
}


func (s *UserService) UpdateAddress(ctx echo.Context, payload *user.UpdateAddressPayload) (*user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)

    
    logger.Info().Str("address_id", payload.ID.String()).Msg("Updating address")

    // Call repository
    updatedAddress, err := s.userRepo.UpdateAddress(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to update address")
        return nil, err
    }

    logger.Info().Str("address_id", updatedAddress.ID).Msg("Address updated successfully")
    return updatedAddress, nil
}


func (s *UserService) DeleteAddress(ctx echo.Context, payload *user.DeleteUserAddressPayload) error {
    logger := middleware.GetLogger(ctx)

    // Validate payload
    if err := payload.Validate(); err != nil {
        logger.Warn().Err(err).Msg("Invalid DeleteUserAddress payload")
        return err
    }

    logger.Info().Str("address_id", payload.ID.String()).Msg("Deleting address")

    // Call repository
    if err := s.userRepo.DeleteAddress(ctx.Request().Context(), payload); err != nil {
        logger.Error().Err(err).Msg("Failed to delete address")
        return err
    }

    logger.Info().Str("address_id", payload.ID.String()).Msg("Address deleted successfully")
    return nil
}



func (s *UserService) SetDefaultAddress(ctx echo.Context, userID string, payload *user.SetDefaultAddressPayload) error {
    logger := middleware.GetLogger(ctx)


    logger.Info().
        Str("user_id", userID).
        Str("address_id", payload.ID.String()).
        Msg("Setting default address")

    // Call repository
    if err := s.userRepo.SetDefaultAddress(ctx.Request().Context(), userID, payload); err != nil {
        logger.Error().Err(err).Msg("Failed to set default address")
        return err
    }

    logger.Info().
        Str("user_id", userID).
        Str("address_id", payload.ID.String()).
        Msg("Default address set successfully")
    return nil
}


// ------------------- GET CURRENT BALANCE -------------------

func (s *UserService) GetCurrentBalance(ctx echo.Context, userID string) (float64, error) {

	logger := middleware.GetLogger(ctx)
	
	balance, err := s.userRepo.GetCurrentBalance(ctx.Request().Context(), userID)
	if err != nil {
		logger.Error().
			Err(err).
			Str("user_id", userID).
			Msg("failed to get current loyalty balance")
		return 0, err
	}

	logger.Info().
		Float64("balance", balance).
		Str("user_id", userID).
		Msg("retrieved current loyalty balance")

	return balance, nil
}


// ------------------- GET USER LOYALTY POINTS -------------------

func (s *UserService) GetUserLoyaltyPoints(ctx echo.Context, userID string, query *user.GetLoyaltyQuery) (*model.PaginatedResponse[user.LoyaltyPointsLedger], error) {
    logger := middleware.GetLogger(ctx)

    history, err := s.userRepo.GetUserLoyaltyPoints(ctx.Request().Context(), userID, query)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch user loyalty points")
        return nil, err
    }

    logger.Info().
        Str("user_id", userID).
        Int("count", len(history.Data)).
        Msg("Fetched loyalty points successfully")

    return history, nil
}



// ------------------- REDEEM POINTS (USER) -------------------

func (s *UserService) RedeemPoints(ctx echo.Context, userID string, payload *user.RedeemPointsPayload) error {
    logger := middleware.GetLogger(ctx)

    logger.Info().
        Str("user_id", userID).
        Float64("points", payload.Points).
        Msg("Attempting to redeem loyalty points")

    if err := s.userRepo.RedeemPoints(ctx.Request().Context(), userID, payload); err != nil {
        logger.Error().
            Err(err).
            Str("user_id", userID).
            Msg("Failed to redeem loyalty points")
        return err
    }

    logger.Info().
        Str("user_id", userID).
        Float64("points", payload.Points).
        Msg("Loyalty points redeemed successfully")

    return nil
}



// ------------------- ADJUST POINTS (ADMIN/SYSTEM) -------------------

func (s *UserService) AdjustPoints(ctx echo.Context, performedBy string, payload *user.AdjustPointsPayload) error {
    logger := middleware.GetLogger(ctx)

    logger.Info().
        Str("user_id", payload.UserID.String()).
        Float64("change", payload.PointsChange).
        Str("performed_by", performedBy).
        Msg("Adjusting loyalty points")

    if err := s.userRepo.AdjustPoints(ctx.Request().Context(), payload, performedBy); err != nil {
        logger.Error().
            Err(err).
            Str("user_id", payload.UserID.String()).
            Msg("Failed to adjust loyalty points")
        return err
    }

    logger.Info().
        Str("user_id", payload.UserID.String()).
        Float64("change", payload.PointsChange).
        Msg("Loyalty points adjusted successfully")

    return nil
}


