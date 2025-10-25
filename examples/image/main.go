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
			Name:  "image",
			Tier:  service.BaseTier,
			Price: 1000,
			FirstPartyCaveats: []service.Caveat{
				service.Expire{Delay: time.Minute},
			},
			Conditions: []service.Condition{
				service.Expire{},
			},
			Get: func(c any) error {
				ctx := c.(*gin.Context)
				resp, err := http.Get("https://picsum.photos/200")
				if err != nil {
					ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch image"})
					return err
				}
				defer resp.Body.Close()

				ctx.DataFromReader(http.StatusOK, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
				return nil
			},
		},
	)
	minter := auth.NewMinter(config, secretStore, challenger)
	router := proxy.L402ProxyServer{Minter: &minter}

	router.Run()
}
