package vendor

import "github.com/gitSanje/khajaride/internal/model"

type Favorite struct {
	model.Base
	UserID     string `json:"userId" db:"user_id"`
	EntityType string `json:"entityType" db:"entity_type"` // 'restaurant' | 'menu_item'
	EntityID   string `json:"entityId" db:"entity_id"`
}
