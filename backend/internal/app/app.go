package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/generated"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/config"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/gateway"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/handler"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/middleware"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/service"
)

type App struct {
	cfg    *config.Config
	pool   *pgxpool.Pool
	server *http.Server
}

func New(cfg *config.Config) (*App, error) {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create pgx pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	log.Println("Connected to PostgreSQL")

	// Gateways
	schoolGW := gateway.NewSchoolGateway()

	// Repositories
	userRepo := repository.NewUserRepository(pool)
	newsRepo := repository.NewNewsRepository(pool)
	hackathonRepo := repository.NewHackathonRepository(pool)
	attendanceRepo := repository.NewAttendanceRepository(pool)
	clubRepo := repository.NewClubRepository(pool)
	govRepo := repository.NewGovRepository(pool)

	// Services
	authService := service.NewAuthService(cfg.BotToken, userRepo)
	schoolService := service.NewSchoolService(schoolGW, userRepo)
	newsService := service.NewNewsService(newsRepo)
	hackathonService := service.NewHackathonService(hackathonRepo)
	attendanceService := service.NewAttendanceService(attendanceRepo)
	clubService := service.NewClubService(clubRepo)
	govService := service.NewGovService(govRepo)

	// Handler
	h := handler.NewHandler(authService, schoolService, newsService, hackathonService, attendanceService, clubService, govService)

	// Router
	mux := http.NewServeMux()
	generated.HandlerFromMux(h, mux)

	// Middleware
	authMW := middleware.Auth(cfg.BotToken, userRepo)
	var httpHandler http.Handler = authMW(mux)
	httpHandler = middleware.CORS(cfg.FrontendURL)(httpHandler)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      httpHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &App{cfg: cfg, pool: pool, server: server}, nil
}

func (a *App) Run() error {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("Server starting on :%s\n", a.cfg.Port)
		if err := a.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v\n", err)
		}
	}()

	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server forced to shutdown: %w", err)
	}

	a.pool.Close()
	log.Println("Server stopped gracefully")
	return nil
}
