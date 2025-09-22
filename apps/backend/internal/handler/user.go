package handler

import (
	"net/http"

	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	Handler
	UserService *service.UserService

}


func NewUserHandler(s *server.Server, us *service.UserService) *UserHandler {
	return &UserHandler{
		Handler:     NewHandler(s),
		UserService: us,
	}
}


func (h *UserHandler) CreateUser(c echo.Context) error {

	return  Handle(h.Handler,
		func(c echo.Context, payload *user.CreateUserPayload) (*user.User,error) {
        return  h.UserService.CreateUser(c,payload)

		},
		http.StatusCreated,
		&user.CreateUserPayload{},
		)(c)
}


// ------------------- GET USER BY ID -------------------
func (h *UserHandler) GetUserByID(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.GetUserByIDPayload) (*user.User, error) {
			userID := middleware.GetUserID(c)
			return h.UserService.GetUserByID(c, userID)
		},
		http.StatusOK,
		&user.GetUserByIDPayload{},
	)(c)
}

// ------------------- UPDATE USER -------------------
func (h *UserHandler) UpdateUser(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.UpdateUserPayload) (*user.User, error) {
			userID := middleware.GetUserID(c)
			return h.UserService.UpdateUser(c, userID, payload)
		},
		http.StatusOK,
		&user.UpdateUserPayload{},
	)(c)
}

// ------------------- GET USERS (PAGINATED) -------------------
func (h *UserHandler) GetUsers(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.GetUsersQuery) (*model.PaginatedResponse[user.User], error) {
			return h.UserService.GetUsers(c, payload)
		},
		http.StatusOK,
		&user.GetUsersQuery{},
	)(c)
}

// ------------------- DELETE USER -------------------
func (h *UserHandler) DeleteUser(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.DeleteUserAddressPayload) (interface{}, error) {
			userID := middleware.GetUserID(c)
			return nil, h.UserService.DeleteUser(c, userID)
		},
		http.StatusNoContent,
		&user.DeleteUserAddressPayload{},
	)(c)
}

// ------------------- CREATE ADDRESS -------------------
func (h *UserHandler) CreateAddress(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.CreateAddressPayload) (*user.UserAddress, error) {
			userID := middleware.GetUserID(c)
			return h.UserService.CreateAddress(c, userID, payload)
		},
		http.StatusCreated,
		&user.CreateAddressPayload{},
	)(c)
}

// ------------------- UPDATE ADDRESS -------------------
func (h *UserHandler) UpdateAddress(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.UpdateAddressPayload) (*user.UserAddress, error) {
			return h.UserService.UpdateAddress(c, payload)
		},
		http.StatusOK,
		&user.UpdateAddressPayload{},
	)(c)
}

// ------------------- DELETE ADDRESS -------------------
func (h *UserHandler) DeleteAddress(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.DeleteUserAddressPayload) (interface{}, error) {
			return nil, h.UserService.DeleteAddress(c, payload)
		},
		http.StatusNoContent,
		&user.DeleteUserAddressPayload{},
	)(c)
}

// ------------------- SET DEFAULT ADDRESS -------------------
func (h *UserHandler) SetDefaultAddress(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.SetDefaultAddressPayload) (interface{}, error) {
			userID := middleware.GetUserID(c)
			return nil, h.UserService.SetDefaultAddress(c, userID, payload)
		},
		http.StatusOK,
		&user.SetDefaultAddressPayload{},
	)(c)
}

// ------------------- GET CURRENT BALANCE -------------------
type getCurrentBalancePayload struct{}

func (p *getCurrentBalancePayload) Validate() error {
	return nil
}

func (h *UserHandler) GetCurrentBalance(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, _ *getCurrentBalancePayload) (interface{}, error) {
			userID := middleware.GetUserID(c)
			return h.UserService.GetCurrentBalance(c, userID)
		},
		http.StatusOK,
		&getCurrentBalancePayload{}, // empty payload that implements Validatable
	)(c)
}

// ------------------- GET USER LOYALTY POINTS -------------------
func (h *UserHandler) GetUserLoyaltyPoints(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.GetLoyaltyQuery) (*model.PaginatedResponse[user.LoyaltyPointsLedger], error) {
			userID := middleware.GetUserID(c)
			return h.UserService.GetUserLoyaltyPoints(c, userID, payload)
		},
		http.StatusOK,
		&user.GetLoyaltyQuery{},
	)(c)
}

// ------------------- REDEEM POINTS -------------------
func (h *UserHandler) RedeemPoints(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.RedeemPointsPayload) (interface{}, error) {
			userID := middleware.GetUserID(c)
			return nil, h.UserService.RedeemPoints(c, userID, payload)
		},
		http.StatusOK,
		&user.RedeemPointsPayload{},
	)(c)
}

// ------------------- ADJUST POINTS (ADMIN/SYSTEM) -------------------
func (h *UserHandler) AdjustPoints(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *user.AdjustPointsPayload) (interface{}, error) {

			return nil, h.UserService.AdjustPoints(c, payload.PerformedBy, payload)
		},
		http.StatusOK,
		&user.AdjustPointsPayload{},
	)(c)
}
