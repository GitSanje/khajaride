package handler

import (
	
	"encoding/json"
	"io"
	"net/http"

	"github.com/gitSanje/khajaride/internal/lib/utils"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
    "github.com/svix/svix-webhooks/go"
	"github.com/labstack/echo/v4"
)

type WebhookHandler struct {
	Handler
	server     *server.Server
	UserService *service.UserService
}

func NewWebhookHandler(s *server.Server, us *service.UserService) *WebhookHandler {
	return &WebhookHandler{
		server:     s,
		UserService: us,
	}
}

func (h *WebhookHandler) HandleClerkWebhook(c echo.Context) error {
    logger := middleware.GetLogger(c)

    body, err := io.ReadAll(c.Request().Body)
    if err != nil {
        logger.Error().Err(err).Msg("failed to read body")
        return echo.NewHTTPError(http.StatusBadRequest, "invalid body")
    }

     // Get signing secret from config
    secret := h.server.Config.Webhooks.ClerkWebhookSigningSecret

    // Use Svix library to verify webhook
    if err := verifyWebhook(body, c.Request().Header, secret); err != nil {
        logger.Error().Err(err).Msg("webhook signature verification failed")
        return echo.NewHTTPError(http.StatusUnauthorized, "invalid signature")
    }

    var event struct {
        Type string `json:"type"`
		Data json.RawMessage `json:"data"`
    }
    if err := json.Unmarshal(body, &event); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid json")
    }

    switch event.Type {
    case "user.created":
        userPayload, err := utils.MapClerkUserToCreateUser(event.Data)
        if err != nil {
            return err
        }
        _, err = h.UserService.CreateUser(c, userPayload)
        if err != nil {
            return err
        }
    default:
        return c.JSON(http.StatusOK, map[string]string{"status": "ignored"})
    }

    return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func verifyWebhook(payload []byte, headers http.Header, secret string) error {
    wh, err := svix.NewWebhook(secret)
    if err != nil {
        return err
    }
    return wh.Verify(payload, headers)
}


