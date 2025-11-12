package consumers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/gitSanje/khajaride/internal/lib/events"
	"github.com/segmentio/kafka-go"
)



type KafkaPayoutJob struct {
	Reader *kafka.Reader
}


func NewKafkaPayoutJob(brokers []string, topic, groupID string) *KafkaPayoutJob {
	return &KafkaPayoutJob{
		Reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers: brokers,
			Topic:   topic,
			GroupID: groupID,
		}),
	}
}


func (k *KafkaPayoutJob) Name() string {
	return "kafka_payout_worker"
}

func (k *KafkaPayoutJob) Description() string {
	return "Consumes payout_requested events from Kafka and executes payouts"
}

func (k *KafkaPayoutJob) Run(ctx context.Context, jobCtx *JobContext) error {
	fmt.Println("✅ Payout Worker Running...")
	for {
		msg, err := k.Reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Println("Error reading message:", err)
			continue
		}

		var e events.PayoutRequestedEvent
		if err := json.Unmarshal(msg.Value, &e); err != nil {
			fmt.Println("Invalid message format:", err)
			continue
		}

		fmt.Println("🎯 Processing payout:", e)

		if _, err := jobCtx.Repositories.Payment.PerformStripePayout(context.Background(), &e); err != nil {
			fmt.Println("❌ Payout failed:", err)
			continue
		}

		fmt.Println("✅ Payout completed for order:", e.OrderID)
	}

}