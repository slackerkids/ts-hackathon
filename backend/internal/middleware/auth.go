package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	initdata "github.com/telegram-mini-apps/init-data-golang"
)

type contextKey string

const InitDataKey contextKey = "initData"

func Auth(botToken string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

			ctx := context.WithValue(r.Context(), InitDataKey, parsed)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
