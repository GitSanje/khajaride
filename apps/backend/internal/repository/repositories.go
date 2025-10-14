package repository

import "github.com/gitSanje/khajaride/internal/server"

type Repositories struct{
	User *UserRepository
	Vendor *VendorRepository
	Search *SearchRepository
}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{
		User: NewUserRepository(s),
		Vendor: NewVendorRepository(s),
		Search: NewSearchRepository(s),
	}
}
