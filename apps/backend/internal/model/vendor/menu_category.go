package vendor

import "github.com/gitSanje/khajaride/internal/model"

type MenuCategory struct {
	model.Base
	ID string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Position    int    `json:"position" db:"position"`
}
