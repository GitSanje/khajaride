package handler

import (
	"net/http"

	"github.com/gitSanje/khajaride/internal/model/payment"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/gitSanje/khajaride/internal/service"
	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	Handler
	PaymentService *service.PaymentService

}


func NewPaymentHandler(s *server.Server, ps *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		Handler:       NewHandler(s),
		PaymentService: ps,
	}
}

func (h *PaymentHandler) KhaltiPayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.KhaltiPaymentPayload) (interface{}, error) {
		
			return nil, h.PaymentService.ProcessKhaltiPayment(c, payload)
		},
		http.StatusCreated,
		&payment.KhaltiPaymentPayload{},
	)(c)

}

func (h *PaymentHandler) VerifyKhaltiPayment(c echo.Context) error {
	return Handle(
		h.Handler,
		func(c echo.Context, payload *payment.KhaltiVerifyPaymentPayload) (interface{}, error) {

			return nil, h.PaymentService.VerifyKhaltiPayment(c, payload)
		},
		http.StatusOK,
		&payment.KhaltiVerifyPaymentPayload{},
	)(c)
}

	
		