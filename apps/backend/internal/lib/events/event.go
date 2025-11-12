package events


import (
	"context"
	"github.com/segmentio/kafka-go"
	"encoding/json"
)

type PayoutRequestedEvent struct {
	SessionId    string  `json:"session_id"`
	OrderID      string  `json:"order_id"`
	VendorUserID string  `json:"vendor_user_id"`
	StripeConnectAccId string `json:"stripe_acc_id"`
	PayoutAccId        string  `json:"payout_acc_id"`
	Amount       float64 `json:"amount"`
}

var Writer = &kafka.Writer{
	Addr:     kafka.TCP("localhost:9092"),
	Topic:    "payout_requested",
	Balancer: &kafka.LeastBytes{},
}

func PublishPayoutRequested(ctx context.Context,e PayoutRequestedEvent) error {
	bytes,_ :=json.Marshal(e)
	return  Writer.WriteMessages(ctx,kafka.Message{Value: bytes})
}