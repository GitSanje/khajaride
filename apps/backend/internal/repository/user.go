package repository

import "github.com/gitSanje/khajaride/internal/server"


type UserRepository struct {
	server *server.Server
}


func NewUserRepository(s *server.Server) *UserRepository {
	return  &UserRepository{server: s}
}