package repository

import (
	"context"
	"errors"
	"strings"

	"fmt"

	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)


type UserRepository struct {
	server *server.Server
}


func NewUserRepository(s *server.Server) *UserRepository {
	return  &UserRepository{server: s}
}

// ------------------- CREATE USER -------------------

func (r *UserRepository) CreateUser(ctx context.Context, payload *user.CreateUserPayload) (*user.User, error) {
    stmt := `
        INSERT INTO users (
            email,
            username,
            phone_number,
            password,
            role,
            profile_picture
        )
        VALUES (
            @Email,
            @Username,
            @PhoneNumber,
            @Password,
            @Role,
            @ProfilePicture
        )
        RETURNING *
    `

    role := "user"
	if payload.Role != nil {
		role = *payload.Role
	}


    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
        "Email":          payload.Email,
        "Username":       payload.Username,
        "PhoneNumber":    payload.PhoneNumber,
        "Password":       payload.Password,
        "Role":           role,
        "ProfilePicture": payload.ProfilePicture,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to create user %s: %w", payload.Email, err)
    }

    createdUser, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.User])
    if err != nil {
        return nil, fmt.Errorf("failed to collect user row for %s: %w", payload.Email, err)
    }

    return &createdUser, nil
}




// ------------------- GET USER BY ID -------------------

func (r *UserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
    stmt := `SELECT * FROM users WHERE id = @id AND deleted_at IS NULL`

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"id":id,
		
	})
    if err != nil {
        return nil, fmt.Errorf("failed to query user by id=%s: %w", id, err)
    }

    user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.User])
    if err != nil {
        return nil, fmt.Errorf("failed to collect user row by id=%s: %w", id, err)
    }

    return &user, nil
}

// ------------------- UPDATE USER -------------------

func (r *UserRepository) UpdateUser(ctx context.Context, payload *user.UpdateUserPayload) (*user.User, error) {
    stmt := `
        UPDATE users
        SET
            email = @Email,
            username = @Username,
            phone_number = @PhoneNumber,
            password = @Password,
            role = @Role,
            profile_picture = @ProfilePicture,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @ID AND deleted_at IS NULL
        RETURNING *
    `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
        "ID":             payload.ID,
        "Email":          payload.Email,
        "Username":       payload.Username,
        "PhoneNumber":    payload.PhoneNumber,
        "Password":       payload.Password,
        "Role":           payload.Role,
        "ProfilePicture": payload.ProfilePicture,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to update user id=%s: %w", payload.ID, err)
    }

    updatedUser, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.User])
    if err != nil {
        return nil, fmt.Errorf("failed to collect updated user id=%s: %w", payload.ID, err)
    }

    return &updatedUser, nil
}

// ------------------- DELETE USER (SOFT DELETE) -------------------

func (r *UserRepository) DeleteUser(ctx context.Context, id uuid.UUID) error {
    stmt := `
        UPDATE users
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = @id AND deleted_at IS NULL
    `

    tag, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{
        "id": id,
    })
    if err != nil {
        return fmt.Errorf("failed to delete user id=%s: %w", id, err)
    }

    if tag.RowsAffected() == 0 {
        return fmt.Errorf("no user found to delete with id=%s", id)
    }

    return nil
}



func (r *UserRepository) GetUsers(ctx context.Context, query *user.GetUsersQuery) (*model.PaginatedResponse[user.User], error) {


	stmt := `SELECT * FROM users WHERE deleted_at IS NULL`
	args := pgx.NamedArgs{}

	conditions := []string{}

	// Filtering
	 if query.Search != nil {
        conditions = append(conditions, "(email ILIKE @search OR username ILIKE @search)")
        args["search"] = "%" + *query.Search + "%"
    }

	 if query.Role != nil {
        conditions = append(conditions, "role = @role")
        args["role"] = *query.Role
    }
    if query.Active != nil {
        conditions = append(conditions, "is_active = @active")
        args["active"] = *query.Active
    }
    if query.Verified != nil {
        conditions = append(conditions, "is_verified = @verified")
        args["verified"] = *query.Verified
    }

    if len(conditions) > 0 {
        stmt += " AND " + strings.Join(conditions, " AND ")
    }

	 // Count total for pagination
	   countStmt := "SELECT COUNT(*) FROM users WHERE deleted_at IS NULL"
	
    if len(conditions) > 0 {
        countStmt += " AND " + strings.Join(conditions, " AND ")
    }

	var total int

	 err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total)
	 if err != nil {
        return nil, fmt.Errorf("failed to get total count of users: %w", err)
    }
	// Sorting
	 stmt += " ORDER BY " + *query.Sort
	 if query.Order != nil && *query.Order == "desc" {
        stmt += " DESC"
    } else {
        stmt += " ASC"
    }

	// Pagination
	stmt += " LIMIT @limit OFFSET @offset"
	args["limit"] = *query.Limit
    args["offset"] = (*query.Page - 1) * (*query.Limit)

	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
    if err != nil {
        return nil, fmt.Errorf("failed to execute get users query: %w", err)
    }

	users, err := pgx.CollectRows(rows, pgx.RowToStructByName[user.User])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
            return &model.PaginatedResponse[user.User]{
                Data:       []user.User{},
                Page:       *query.Page,
                Limit:      *query.Limit,
                Total:      0,
                TotalPages: 0,
            }, nil
        }
		return nil, fmt.Errorf("failed to collect users: %w", err)
	}
     return &model.PaginatedResponse[user.User]{
        Data:       users,
        Page:       *query.Page,
        Limit:      *query.Limit,
        Total:      total,
        TotalPages: (total + *query.Limit - 1) / *query.Limit,
    }, nil

}