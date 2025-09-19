package service

import (
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/google/uuid"
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



func ( s *UserService) CreateUser ( ctx echo.Context, userId string, payload *user.CreateUserPayload) ( *user.User, error) {
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
        Str("user_id", createdUser.ID.String()).
        Str("email", createdUser.Email).
        Str("username", createdUser.Username).
        Str("role", createdUser.Role).
        Msg("User created successfully")

    return createdUser, nil

}


func (s *UserService) GetUserByID(ctx echo.Context, userID uuid.UUID) (*user.User, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID.String()).Msg("Fetching user by ID")

    u, err := s.userRepo.GetUserByID(ctx.Request().Context(), userID)
    if err != nil {
        logger.Error().Err(err).Str("user_id", userID.String()).Msg("Failed to fetch user by ID")
        return nil, err
    }

    logger.Info().Str("user_id", userID.String()).Msg("User fetched successfully")
    return u, nil
}


func (s *UserService) UpdateUser(ctx echo.Context, userID uuid.UUID, payload *user.UpdateUserPayload) (*user.User, error) {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID.String()).Msg("Updating user")

    updatedUser, err := s.userRepo.UpdateUser(ctx.Request().Context(), userID, payload)
    if err != nil {
        logger.Error().Err(err).Str("user_id", userID.String()).Msg("Failed to update user")
        return nil, err
    }

    logger.Info().
        Str("user_id", updatedUser.ID.String()).
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


func (s *UserService) DeleteUser(ctx echo.Context, userID uuid.UUID) error {
    logger := middleware.GetLogger(ctx)

    logger.Info().Str("user_id", userID.String()).Msg("Deleting user")

    if err := s.userRepo.DeleteUser(ctx.Request().Context(), userID); err != nil {
        logger.Error().Err(err).Str("user_id", userID.String()).Msg("Failed to delete user")
        return err
    }

    logger.Info().Str("user_id", userID.String()).Msg("User deleted successfully")
    return nil
}



func (s *UserService) CreateAddress(ctx echo.Context, userID uuid.UUID, payload *user.CreateAddressPayload) (*user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)

    // Validate payload
    if err := payload.Validate(); err != nil {
        logger.Warn().Err(err).Msg("Invalid CreateAddress payload")
        return nil, err
    }

    logger.Info().Str("user_id", userID.String()).Msg("Creating new address")

    // Call repository
    address, err := s.userRepo.CreateAddress(ctx.Request().Context(), userID, payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to create address")
        return nil, err
    }

    logger.Info().Str("address_id", address.ID.String()).Msg("Address created successfully")
    return address, nil
}


func (s *UserService) UpdateAddress(ctx echo.Context, payload *user.UpdateAddressPayload) (*user.UserAddress, error) {
    logger := middleware.GetLogger(ctx)

    // Validate payload
    if err := payload.Validate(); err != nil {
        logger.Warn().Err(err).Msg("Invalid UpdateAddress payload")
        return nil, err
    }

    logger.Info().Str("address_id", payload.ID.String()).Msg("Updating address")

    // Call repository
    updatedAddress, err := s.userRepo.UpdateAddress(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to update address")
        return nil, err
    }

    logger.Info().Str("address_id", updatedAddress.ID.String()).Msg("Address updated successfully")
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



func (s *UserService) SetDefaultAddress(ctx echo.Context, userID uuid.UUID, payload *user.SetDefaultAddressPayload) error {
    logger := middleware.GetLogger(ctx)


    logger.Info().
        Str("user_id", userID.String()).
        Str("address_id", payload.ID.String()).
        Msg("Setting default address")

    // Call repository
    if err := s.userRepo.SetDefaultAddress(ctx.Request().Context(), userID, payload); err != nil {
        logger.Error().Err(err).Msg("Failed to set default address")
        return err
    }

    logger.Info().
        Str("user_id", userID.String()).
        Str("address_id", payload.ID.String()).
        Msg("Default address set successfully")
    return nil
}


// ------------------- GET CURRENT BALANCE -------------------

func (s *UserService) GetCurrentBalance(ctx echo.Context, userID uuid.UUID) (float64, error) {
	
	logger := middleware.GetLogger(ctx)
	
	balance, err := s.userRepo.GetCurrentBalance(ctx.Request().Context(), userID)
	if err != nil {
		logger.Error().
			Err(err).
			Str("user_id", userID.String()).
			Msg("failed to get current loyalty balance")
		return 0, err
	}

	logger.Info().
		Float64("balance", balance).
		Str("user_id", userID.String()).
		Msg("retrieved current loyalty balance")

	return balance, nil
}