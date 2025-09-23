package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/gitSanje/khajaride/internal/lib/utils"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"

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

    sig := c.Request().Header.Get("svix-signature")
    if sig == "" {
        return echo.NewHTTPError(http.StatusUnauthorized, "missing signature")
    }

    if !h.VerifyClerkWebhookSignature(c, body, sig) {
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


func (h *WebhookHandler) VerifyClerkWebhookSignature(c echo.Context, payload []byte, signatureHeader string) bool {
	logger := middleware.GetLogger(c)
	secret := h.server.Config.Webhooks.ClerkWebhookSigningSecret

	// Header format: "v1,<base64_signature>"
	parts := strings.Split(signatureHeader, ",")
	if len(parts) != 2 || parts[0] != "v1" {
		logger.Error().Msg("invalid svix signature header format")
		return false
	}

	sigBase64 := parts[1]
	sigBytes, err := base64.StdEncoding.DecodeString(sigBase64)
	if err != nil {
		logger.Error().Err(err).Msg("failed to decode base64 signature")
		return false
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expectedMAC := mac.Sum(nil)
   logger.Debug().
        Str("expected_mac", hex.EncodeToString(expectedMAC)).
        Str("signature_received", hex.EncodeToString(sigBytes)).
        Msg("Verifying webhook signature")
	return hmac.Equal(expectedMAC, sigBytes)
}
