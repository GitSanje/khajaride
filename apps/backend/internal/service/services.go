package service

import (
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
}

func NewServices(s *server.Server, repos *repository.Repositories) (*Services, error) {
	authService := NewAuthService(s)

	return &Services{
		Job:    s.Job,
		Auth:   authService,
		User:   NewUserService(s, repos.User),
		Vendor: NewVendorService(s, repos.Vendor),
		Search: NewSearchService(s, repos.Search),
		Cart:   NewCartService(s, repos.Cart),
	}, nil
}
