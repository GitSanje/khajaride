package service

import (
	"fmt"

	"github.com/gitSanje/khajaride/internal/lib/aws"
	"github.com/gitSanje/khajaride/internal/lib/job"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
)

type Services struct {
	Auth   *AuthService
	Job    *job.JobService
	Vendor *VendorService
	User   *UserService
	Search *SearchService
	Cart   *CartService
	Order  *OrderService
	Payment *PaymentService
}

func NewServices(s *server.Server, repos *repository.Repositories) (*Services, error) {
	authService := NewAuthService(s)

    awsClient,err := aws.NewAWS(s)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS client: %w", err)
	}

	
	return &Services{
		Job:    s.Job,
		Auth:   authService,
		User:   NewUserService(s, repos.User),
		Vendor: NewVendorService(s, repos.Vendor,awsClient ),
		Search: NewSearchService(s, repos.Search),
		Cart:   NewCartService(s, repos.Cart),
		Order:  NewOrderService(s, repos.Order, repos.Cart),
		Payment: NewPaymentService(s, repos.Payment,repos.Order),
	}, nil
}
