package handler

import (
	"encoding/json"
	"net/http"

	"github.com/tomorrow-school/ts-hackathon/backend/generated"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/service"
)

// Handler implements the generated.ServerInterface.
type Handler struct {
	authService *service.AuthService
}

// Compile-time check that Handler implements ServerInterface.
var _ generated.ServerInterface = (*Handler)(nil)

func NewHandler(authService *service.AuthService) *Handler {
	return &Handler{
		authService: authService,
	}
}

// GetHealth implements generated.ServerInterface.
func (h *Handler) GetHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, generated.HealthResponse{
		Status: "ok",
	})
}

// AuthTelegram implements generated.ServerInterface.
func (h *Handler) AuthTelegram(w http.ResponseWriter, r *http.Request) {
	var req generated.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{
			Error: "invalid request body",
		})
		return
	}

	user, err := h.authService.AuthenticateWithInitData(r.Context(), req.InitData)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, generated.AuthResponse{
		User: generated.User{
			Id:         user.ID,
			TelegramId: user.TelegramID,
			Username:   strPtr(user.Username),
			FirstName:  strPtr(user.FirstName),
			LastName:   strPtr(user.LastName),
			PhotoUrl:   strPtr(user.PhotoURL),
			Role:       generated.UserRole(user.Role),
			CreatedAt:  &user.CreatedAt,
			UpdatedAt:  &user.UpdatedAt,
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
