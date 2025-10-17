package repository

import (
	"context"
	"errors"
	"strings"

	"fmt"

	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/user"
	"github.com/gitSanje/khajaride/internal/server"

	"github.com/jackc/pgx/v5"
)


type UserRepository struct {
	server *server.Server
}


func NewUserRepository(s *server.Server) *UserRepository {
	return  &UserRepository{server: s}
}

//-- ==================================================
//--  USER
//-- ==================================================


// ------------------- CREATE USER -------------------

func (r *UserRepository) CreateUser(ctx context.Context, payload *user.CreateUserPayload) (*user.User, error) {
    stmt := `
        INSERT INTO users (
            id,
            email,
            username,
            phone_number,
            password,
            role,
            profile_picture
        )
        VALUES (
            COALESCE(@ID, gen_random_uuid()::TEXT),
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
	if payload.Role != "" {
		role = payload.Role
	}


    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
        "ID":             payload.ID,
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

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*user.User, error) {
    stmt := `SELECT * FROM users WHERE id = @id `

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

func (r *UserRepository) UpdateUser(ctx context.Context, userID string, payload *user.UpdateUserPayload) (*user.User, error) {
    setClauses := []string{}
    args := pgx.NamedArgs{"id": userID}

    if payload.Email != nil {
        setClauses = append(setClauses, "email = @email")
        args["email"] = *payload.Email
    }
    if payload.Username != nil {
        setClauses = append(setClauses, "username = @username")
        args["username"] = *payload.Username
    }
    if payload.PhoneNumber != nil {
        setClauses = append(setClauses, "phone_number = @phone_number")
        args["phone_number"] = *payload.PhoneNumber
    }
    if payload.Password != nil {
        setClauses = append(setClauses, "password = @password")
        args["password"] = *payload.Password
    }
    if payload.Role != nil {
        setClauses = append(setClauses, "role = @role")
        args["role"] = *payload.Role
    }
    if payload.ProfilePicture != nil {
        setClauses = append(setClauses, "profile_picture = @profile_picture")
        args["profile_picture"] = *payload.ProfilePicture
    }

    if len(setClauses) == 0 {
        return r.GetUserByID(ctx, userID) // nothing to update, return current user
    }

    stmt := `
        UPDATE users
        SET ` + strings.Join(setClauses, ", ") + `
        WHERE id = @id 
        RETURNING *
    `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
    if err != nil {
        return nil, fmt.Errorf("failed to update user %s: %w", userID, err)
    }

    updatedUser, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.User])
    if err != nil {
        return nil, fmt.Errorf("failed to collect updated user %s: %w", userID, err)
    }

    return &updatedUser, nil
}

// ------------------- DELETE USER (SOFT DELETE) -------------------

func (r *UserRepository) DeleteUser(ctx context.Context, id string) error {
    stmt := `
        DELETE FROM users
        WHERE id = @id 
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


// ------------------- GET  USERS (Query) -------------------
func (r *UserRepository) GetUsers(ctx context.Context, query *user.GetUsersQuery) (*model.PaginatedResponse[user.User], error) {


	stmt := `SELECT * FROM users`
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


// ------------------- CREATE ADDRESS -------------------

func (r *UserRepository) CreateAddress(ctx context.Context, userID string, payload *user.CreateAddressPayload) (*user.UserAddress, error) {
    stmt := `
        INSERT INTO user_addresses (
            user_id,
            label,
            latitude,
            longitude,
            is_default
        )
        VALUES (
            @UserID,
            @Label,
            @Latitude,
            @Longitude,
            COALESCE(@IsDefault, false)
        )
        RETURNING *
    `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
        "UserID":    userID,
        "Label":     payload.Label,
        "Latitude":  payload.Latitude,
        "Longitude": payload.Longitude,
        "IsDefault": payload.IsDefault,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to create address: %w", err)
    }

    createdAddr, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.UserAddress])
    if err != nil {
        return nil, fmt.Errorf("failed to collect created address row: %w", err)
    }

    return &createdAddr, nil
}

// ------------------- UPDATE ADDRESS -------------------

func (r *UserRepository) UpdateAddress(ctx context.Context, payload *user.UpdateAddressPayload) (*user.UserAddress, error) {
    stmt := `
        UPDATE user_addresses
        SET
            label = COALESCE(@Label, label),
            latitude = COALESCE(@Latitude, latitude),
            longitude = COALESCE(@Longitude, longitude),
            is_default = COALESCE(@IsDefault, is_default),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @ID
        RETURNING *
    `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
        "ID":        payload.ID,
        "Label":     payload.Label,
        "Latitude":  payload.Latitude,
        "Longitude": payload.Longitude,
        "IsDefault": payload.IsDefault,
    })


   if err != nil {
        return nil, fmt.Errorf("failed to update address id=%s: %w", payload.ID, err)
    }

    updatedAddr, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.UserAddress])
    if err != nil {
        return nil, fmt.Errorf("failed to collect updated address id=%s: %w", payload.ID, err)
    }

    return &updatedAddr, nil
}


// ------------------- GET ADDRESS BY ID -------------------

func (r *UserRepository) GetUserAddressByID(ctx context.Context, id string) (*user.UserAddress, error) {
    stmt := `SELECT * FROM user_addresses WHERE id = @id `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"id":id,
	})
    if err != nil {
        return nil, fmt.Errorf("failed to query user by id=%s: %w", id, err)
    }

    useraddress, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.UserAddress])
    if err != nil {
        return nil, fmt.Errorf("failed to collect user row by id=%s: %w", id, err)
    }

    return &useraddress, nil
}

// ------------------- GET ADDRESSES BY USER ID -------------------

func (r *UserRepository) GetUserAddressesByUserID(ctx context.Context, userID string) ([]user.UserAddress, error) {
    stmt := `SELECT * FROM user_addresses WHERE user_id = @user_id `

    rows, err := r.server.DB.Pool.Query(ctx, stmt, pgx.NamedArgs{
		"user_id": userID,
	})
    if err != nil {
        return nil, fmt.Errorf("failed to query user addresses by user_id=%s: %w", userID, err)
    }

   addresses, err := pgx.CollectRows(rows, pgx.RowToStructByName[user.UserAddress])
   if err != nil {
       return nil, fmt.Errorf("failed to collect user addresses by user_id=%s: %w", userID, err)
   }

    return addresses, nil
}





// ------------------- DELETE ADDRESS -------------------

func (r *UserRepository) DeleteAddress(ctx context.Context, payload *user.DeleteUserAddressPayload) error {
    stmt := `
        UPDATE user_addresses
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = @ID
    `

    ct, err := r.server.DB.Pool.Exec(ctx, stmt, pgx.NamedArgs{"ID": payload.ID})
    if err != nil {
        return fmt.Errorf("failed to delete address id=%s: %w", payload.ID, err)
    }

    if ct.RowsAffected() == 0 {
        return errors.New("no address found to delete")
    }

    return nil
}


// ------------------- SET DEFAULT ADDRESS -------------------

func (r *UserRepository) SetDefaultAddress(ctx context.Context, userID string, payload *user.SetDefaultAddressPayload) error {
    tx, err := r.server.DB.Pool.Begin(ctx)
    if err != nil {
        return fmt.Errorf("failed to start transaction: %w", err)
    }
    defer tx.Rollback(ctx)

    // First reset all addresses for this user
    _, err = tx.Exec(ctx, `
        UPDATE user_addresses
        SET is_default = false
        WHERE user_id = @UserID 
    `, pgx.NamedArgs{"UserID": userID})
    if err != nil {
        return fmt.Errorf("failed to unset defaults: %w", err)
    }

    // Then set this one as default
    ct, err := tx.Exec(ctx, `
        UPDATE user_addresses
        SET is_default = true
        WHERE id = @ID AND user_id = @UserID 
    `, pgx.NamedArgs{"ID": payload.ID, "UserID": userID})
    if err != nil {
        return fmt.Errorf("failed to set default address: %w", err)
    }

    if ct.RowsAffected() == 0 {
        return errors.New("no address found to set as default")
    }

	 if err := tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %w", err)
    }

    return nil
}


// ------------------- GET  USERS LOYALTY -------------------

func (r *UserRepository) GetUserLoyaltyPoints(ctx context.Context, userID string, query *user.GetLoyaltyQuery) (*model.PaginatedResponse[user.LoyaltyPointsLedger], error) {

	stmt := 
	`
	 SELECT * FROM loyalty_points_ledger
		WHERE user_id = @user_id
	`

	args := pgx.NamedArgs{"UserID": userID}

	conditions := [] string{}

	if( query.TransactionType != nil){
		conditions = append(conditions, "transaction_type = @transaction_type")
		args["transaction_type"] = *query.TransactionType
	}
	if query.FromDate != nil {
		conditions = append(conditions, "performed_at >= @from_date")
		args["from_date"] = *query.FromDate
	}

	if query.ToDate != nil {
		conditions = append(conditions, "performed_at <= @to_date")
		args["to_date"] = *query.ToDate
	}
    if len(conditions) > 0 {
		stmt += " AND " + strings.Join(conditions, " AND ")
	}

	// Count total for pagination
	countStmt := "SELECT COUNT(*) FROM loyalty_points_ledger WHERE user_id = @user_id"
	if len(conditions) > 0 {
		countStmt += " AND " + strings.Join(conditions, " AND ")
	}

	var total int

    if err := r.server.DB.Pool.QueryRow(ctx, countStmt, args).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count loyalty history: %w", err)
	}
    stmt += " ORDER BY performed_at DESC LIMIT @limit OFFSET @offset"

	args["limit"] = *query.Limit
	args["offset"] = (*query.Page - 1) * (*query.Limit)
	rows, err := r.server.DB.Pool.Query(ctx, stmt, args)
	if err != nil {
		return nil, fmt.Errorf("failed to query loyalty history: %w", err)
	}

	history, err := pgx.CollectRows(rows, pgx.RowToStructByName[user.LoyaltyPointsLedger])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			history = []user.LoyaltyPointsLedger{}
		} else {
			return nil, fmt.Errorf("failed to collect loyalty rows: %w", err)
		}
	}

	resp := &model.PaginatedResponse[user.LoyaltyPointsLedger]{
		Data:       history,
		Page:       *query.Page,
		Limit:      *query.Limit,
		Total:      total,
		TotalPages: (total + *query.Limit - 1) / *query.Limit,
	}

	return  resp,nil

}


// ------------------- REDEEM POINTS (USER) -------------------


func (r *UserRepository) RedeemPoints(ctx context.Context, userID string, payload *user.RedeemPointsPayload) error {

	tx, err := r.server.DB.Pool.Begin(ctx)

	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	defer tx.Rollback(ctx)

	// check if user has enough points

	var currentBalance float64

	err = tx.QueryRow(ctx, "SELECT COALESCE(SUM(points_change),0) FROM loyalty_points_ledger WHERE user_id = $1", userID).Scan(&currentBalance)
	if err != nil {
		return fmt.Errorf("failed to get current balance: %w", err)
	}

	if currentBalance < payload.Points {
		return errors.New("insufficient loyalty points")
	}

	// insert redeem transaction
	_, err = tx.Exec(ctx, `
		INSERT INTO loyalty_points_ledger (
			user_id,
			transaction_type,
			points_change,
			balance_after,
			reason,
			performed_by,
			performed_at
		) VALUES (
			$1, 'REDEEM', $2, $3, $4, $1, NOW()
		)
	`, userID, -payload.Points, currentBalance-payload.Points, payload.Reason)
	if err != nil {
		return fmt.Errorf("failed to insert redeem points: %w", err)
	}

	return tx.Commit(ctx)
}



// ------------------- ADJUST POINTS (ADMIN/SYSTEM) -------------------

func (r *UserRepository) AdjustPoints(ctx context.Context, payload *user.AdjustPointsPayload, performedBy string) error {
	tx, err := r.server.DB.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// get current balance
	var balance float64
	err = tx.QueryRow(ctx, "SELECT COALESCE(SUM(points_change),0) FROM loyalty_points_ledger WHERE user_id = $1", payload.UserID).Scan(&balance)
	if err != nil {
		return fmt.Errorf("failed to get current balance: %w", err)
	}

	newBalance := balance + payload.PointsChange

	// insert ledger row
	_, err = tx.Exec(ctx, `
		INSERT INTO loyalty_points_ledger (
			user_id,
			transaction_type,
			points_change,
			balance_after,
			reason,
			reference_id,
			reference_type,
			performed_by,
			performed_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, NOW()
		)
	`, payload.UserID, payload.TransactionType, payload.PointsChange, newBalance, payload.Reason, payload.ReferenceID, payload.ReferenceType, performedBy)
	if err != nil {
		return fmt.Errorf("failed to insert adjust points: %w", err)
	}

	return tx.Commit(ctx)
}



// -------------------GET CURRENT BALANCE  -------------------

func (r *UserRepository) GetCurrentBalance(ctx context.Context, userID string) (float64, error) {
    var balance float64
    err := r.server.DB.Pool.QueryRow(ctx, `
        SELECT COALESCE(SUM(points_change), 0)
		FROM loyalty_points_ledger
		WHERE user_id = $1
    `, userID).Scan(&balance)
    if err != nil {
        return 0, fmt.Errorf("failed to get current balance: %w", err)
    }
    return balance, nil
}
