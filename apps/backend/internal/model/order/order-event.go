package order

import (
	"encoding/json"

	"github.com/gitSanje/khajaride/internal/model"
)

type OrderEvent struct {
    model.Base
    OrderID   string          `json:"orderId" db:"order_id"`
    EventType string          `json:"eventType" db:"event_type"`
    Payload   json.RawMessage `json:"payload" db:"payload"`
}
