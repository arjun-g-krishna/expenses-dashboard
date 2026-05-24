package main

import (
	"context"
	"net/http"

	"github.com/Arjun-G-Krishna/expenses-dashboard/config"
	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/repository"
	log "github.com/sirupsen/logrus"
)

func main() {
    cfg := config.LoadConfig()

    ctx := context.Background()
    repo, err := repository.NewPostgresRepo(ctx, cfg.GetDSN())
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer repo.Close()

    if err := repo.Init(ctx); err != nil {
        log.Fatalf("Failed to initialize schema: %v", err)
    }

    svc := service.NewService(repo)
    h := handler.NewHandler(svc)

    mux := http.NewServeMux()
    h.RegisterRoutes(mux)

    server := &http.Server{
        Addr:    ":8080",
        Handler: enableCORS(mux),
        // timeouts...
    }

    log.Println("Server running on :8080 with PostgreSQL")
    log.Fatal(server.ListenAndServe())
}