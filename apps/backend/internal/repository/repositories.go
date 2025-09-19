package repository

import "github.com/gitSanje/khajaride/internal/server"

type Repositories struct{
	User *UserRepository
}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{
		User: NewUserRepository(s),
	}
}
