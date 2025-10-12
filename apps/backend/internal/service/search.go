package service

import "github.com/gitSanje/khajaride/internal/server"


type SearchService struct {

	server *server.Server
}

func NewSearchService(server *server.Server) *SearchService {
	return &SearchService{
		server: server,
	}
}