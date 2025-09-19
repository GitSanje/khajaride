package service

import "github.com/gitSanje/khajaride/internal/server"


type UserService struct {
	userRepos *repository.UserRepository
	server *server.Server
}