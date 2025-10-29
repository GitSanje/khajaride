package repository

import "github.com/gitSanje/khajaride/internal/server"

type Repositories struct{
	User   *UserRepository
	Vendor *VendorRepository
	Search *SearchRepository
	Cart    *CartRepository
	Order   *OrderRepository
	Payment *PaymentRepository
}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{
		User: NewUserRepository(s),
		Vendor: NewVendorRepository(s),
		Search: NewSearchRepository(s),
		Cart:   NewCartRepository(s),
		Order:  NewOrderRepository(s),
		Payment: NewPaymentRepository(s),
	}
}
