package main

import (
	"lsat/auth"
	"lsat/mock"
	"lsat/proxy"
	"lsat/secrets"
	"lsat/service"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	secretStore = secrets.NewSecretFactory()
	challenger  = mock.NewChallenger()
)

func main() {
	config := service.NewConfig(
		service.Service{
			Name:  "test",
			Tier:  service.BaseTier,
			Price: 100,
			FirstPartyCaveats: []service.Caveat{
				service.Expire{Delay: time.Hour},
			},
			Conditions: []service.Condition{service.Expire{}},
			Get: func(c any) error {
				ctx := c.(*gin.Context)
				ctx.JSON(http.StatusOK, "Hello, World!")
				return nil
			},
		},
	)
	minter := auth.NewMinter(config, secretStore, challenger)
	router := proxy.L402ProxyServer{Minter: &minter}

	router.Run()
}
