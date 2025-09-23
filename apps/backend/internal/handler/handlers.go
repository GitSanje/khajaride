package handler

import (
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
)

type Handlers struct {
	Health  *HealthHandler
	OpenAPI *OpenAPIHandler
	User    *UserHandler
	Webhooks *WebhookHandler
}

func NewHandlers(s *server.Server, services *service.Services) *Handlers {
	return &Handlers{
		Health:  NewHealthHandler(s),
		OpenAPI: NewOpenAPIHandler(s),
		User: NewUserHandler(s, services.User),
		Webhooks: NewWebhookHandler(s, services.User),
	}
}
