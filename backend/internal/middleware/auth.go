package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	initdata "github.com/telegram-mini-apps/init-data-golang"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type contextKey string

const (
	InitDataKey contextKey = "initData"
	UserKey     contextKey = "user"
)

// UserFromContext extracts the authenticated user from the request context.
func UserFromContext(ctx context.Context) *model.User {
	u, _ := ctx.Value(UserKey).(*model.User)
	return u
}

// publicRoutes that don't require authentication.
var publicRoutes = map[string]bool{
	"GET /api/health":         true,
	"POST /api/auth/telegram": true,
}

// publicPrefixes that don't require auth for GET requests.
var publicGETPrefixes = []string{
	"/api/news",
	"/api/hackathons",
}

func isPublic(method, path string) bool {
	key := method + " " + path
	if publicRoutes[key] {
		return true
	}
	// Allow public GET access to news and hackathon listing/detail
	if method == "GET" {
		for _, prefix := range publicGETPrefixes {
			if strings.HasPrefix(path, prefix) {
				return true
			}
		}
	}
	return false
}

// Auth validates the Telegram initData, resolves the user from the DB, and injects both into context.
// Public routes skip authentication entirely.
func Auth(botToken string, userRepo *repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for public routes
			if isPublic(r.Method, r.URL.Path) {
				next.ServeHTTP(w, r)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "tma" {
				http.Error(w, `{"error":"invalid authorization format, expected: tma <initData>"}`, http.StatusUnauthorized)
				return
			}

			rawInitData := parts[1]

			// Validate initData signature with 24h expiration
			if err := initdata.Validate(rawInitData, botToken, 24*time.Hour); err != nil {
				http.Error(w, `{"error":"invalid init data: `+err.Error()+`"}`, http.StatusUnauthorized)
				return
			}

			// Parse the validated init data
			parsed, err := initdata.Parse(rawInitData)
			if err != nil {
				http.Error(w, `{"error":"failed to parse init data"}`, http.StatusUnauthorized)
				return
			}

			if parsed.User.ID == 0 {
				http.Error(w, `{"error":"init data missing user"}`, http.StatusUnauthorized)
				return
			}

			// Resolve the full user from the database
			user, err := userRepo.FindByTelegramID(r.Context(), parsed.User.ID)
			if err != nil {
				http.Error(w, `{"error":"failed to resolve user"}`, http.StatusInternalServerError)
				return
			}
			if user == nil {
				http.Error(w, `{"error":"user not found, please authenticate first"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), InitDataKey, parsed)
			ctx = context.WithValue(ctx, UserKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
