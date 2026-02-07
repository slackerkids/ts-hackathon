package handler

import (
	"encoding/json"
	"net/http"

	"github.com/tomorrow-school/ts-hackathon/backend/generated"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/middleware"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/service"
)

// Handler implements the generated.ServerInterface.
type Handler struct {
	authService      *service.AuthService
	newsService      *service.NewsService
	hackathonService *service.HackathonService
}

// Compile-time check that Handler implements ServerInterface.
var _ generated.ServerInterface = (*Handler)(nil)

func NewHandler(
	authService *service.AuthService,
	newsService *service.NewsService,
	hackathonService *service.HackathonService,
) *Handler {
	return &Handler{
		authService:      authService,
		newsService:      newsService,
		hackathonService: hackathonService,
	}
}

// ─── Health ──────────────────────────────────────────────────────────────────

func (h *Handler) GetHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, generated.HealthResponse{Status: "ok"})
}

// ─── Auth ────────────────────────────────────────────────────────────────────

func (h *Handler) AuthTelegram(w http.ResponseWriter, r *http.Request) {
	var req generated.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}

	user, err := h.authService.AuthenticateWithInitData(r.Context(), req.InitData)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, generated.AuthResponse{User: userToGenerated(user)})
}

// ─── Users ───────────────────────────────────────────────────────────────────

func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}
	writeJSON(w, http.StatusOK, userToGenerated(user))
}

// ─── News ────────────────────────────────────────────────────────────────────

func (h *Handler) ListNews(w http.ResponseWriter, r *http.Request, params generated.ListNewsParams) {
	tag := ""
	if params.Tag != nil {
		tag = *params.Tag
	}
	list, err := h.newsService.List(r.Context(), tag)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.News, len(list))
	for i, n := range list {
		result[i] = newsToGenerated(&n)
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) GetNews(w http.ResponseWriter, r *http.Request, id int64) {
	n, err := h.newsService.GetByID(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	if n == nil {
		writeJSON(w, http.StatusNotFound, generated.ErrorResponse{Error: "news not found"})
		return
	}
	writeJSON(w, http.StatusOK, newsToGenerated(n))
}

func (h *Handler) CreateNews(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	var req generated.NewsCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}

	n := &model.News{
		Title:    req.Title,
		Content:  req.Content,
		Tag:      req.Tag,
		AuthorID: &user.ID,
	}
	if req.ImageUrl != nil {
		n.ImageURL = *req.ImageUrl
	}

	result, err := h.newsService.Create(r.Context(), n)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, newsToGenerated(result))
}

func (h *Handler) UpdateNews(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	var req generated.NewsCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}

	n := &model.News{
		Title:   req.Title,
		Content: req.Content,
		Tag:     req.Tag,
	}
	if req.ImageUrl != nil {
		n.ImageURL = *req.ImageUrl
	}

	result, err := h.newsService.Update(r.Context(), id, n)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	if result == nil {
		writeJSON(w, http.StatusNotFound, generated.ErrorResponse{Error: "news not found"})
		return
	}
	writeJSON(w, http.StatusOK, newsToGenerated(result))
}

func (h *Handler) DeleteNews(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	if err := h.newsService.Delete(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─── Hackathons ──────────────────────────────────────────────────────────────

func (h *Handler) ListHackathons(w http.ResponseWriter, r *http.Request, params generated.ListHackathonsParams) {
	status := ""
	if params.Status != nil {
		status = string(*params.Status)
	}
	list, err := h.hackathonService.List(r.Context(), status)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.Hackathon, len(list))
	for i, hack := range list {
		result[i] = hackathonToGenerated(&hack)
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) GetHackathon(w http.ResponseWriter, r *http.Request, id int64) {
	hack, err := h.hackathonService.GetByID(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	if hack == nil {
		writeJSON(w, http.StatusNotFound, generated.ErrorResponse{Error: "hackathon not found"})
		return
	}
	writeJSON(w, http.StatusOK, hackathonToGenerated(hack))
}

func (h *Handler) CreateHackathon(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	var req generated.HackathonCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}

	hack := &model.Hackathon{
		Title:       req.Title,
		Description: req.Description,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
	}

	result, err := h.hackathonService.Create(r.Context(), hack)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, hackathonToGenerated(result))
}

func (h *Handler) DeleteHackathon(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	if err := h.hackathonService.Delete(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ApplyToHackathon(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}

	var req generated.HackathonApplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}

	teamName := ""
	if req.TeamName != nil {
		teamName = *req.TeamName
	}

	app, err := h.hackathonService.Apply(r.Context(), id, user.ID, teamName)
	if err != nil {
		if err.Error() == "already applied to this hackathon" {
			writeJSON(w, http.StatusConflict, generated.ErrorResponse{Error: err.Error()})
			return
		}
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, applicationToGenerated(app))
}

func (h *Handler) ListHackathonApplications(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if !requireAdmin(w, user) {
		return
	}

	apps, err := h.hackathonService.ListApplications(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.HackathonApplication, len(apps))
	for i, a := range apps {
		result[i] = applicationToGenerated(&a)
	}
	writeJSON(w, http.StatusOK, result)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func requireAdmin(w http.ResponseWriter, user *model.User) bool {
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return false
	}
	if user.Role != model.RoleAdmin {
		writeJSON(w, http.StatusForbidden, generated.ErrorResponse{Error: "admin access required"})
		return false
	}
	return true
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

func int64Ptr(n int64) *int64 {
	if n == 0 {
		return nil
	}
	return &n
}

func userToGenerated(u *model.User) generated.User {
	return generated.User{
		Id:         u.ID,
		TelegramId: u.TelegramID,
		Username:   strPtr(u.Username),
		FirstName:  strPtr(u.FirstName),
		LastName:   strPtr(u.LastName),
		PhotoUrl:   strPtr(u.PhotoURL),
		Role:       generated.UserRole(u.Role),
		CreatedAt:  &u.CreatedAt,
		UpdatedAt:  &u.UpdatedAt,
	}
}

func newsToGenerated(n *model.News) generated.News {
	return generated.News{
		Id:        n.ID,
		Title:     n.Title,
		Content:   n.Content,
		ImageUrl:  strPtr(n.ImageURL),
		Tag:       n.Tag,
		AuthorId:  n.AuthorID,
		CreatedAt: n.CreatedAt,
		UpdatedAt: &n.UpdatedAt,
	}
}

func hackathonToGenerated(h *model.Hackathon) generated.Hackathon {
	return generated.Hackathon{
		Id:          h.ID,
		Title:       h.Title,
		Description: h.Description,
		Status:      generated.HackathonStatus(h.Status),
		StartDate:   h.StartDate,
		EndDate:     h.EndDate,
		CreatedAt:   &h.CreatedAt,
	}
}

func applicationToGenerated(a *model.HackathonApplication) generated.HackathonApplication {
	result := generated.HackathonApplication{
		Id:          a.ID,
		HackathonId: a.HackathonID,
		UserId:      a.UserID,
		TeamName:    strPtr(a.TeamName),
		Status:      a.Status,
		CreatedAt:   &a.CreatedAt,
	}
	if a.User != nil {
		u := userToGenerated(a.User)
		result.User = &u
	}
	return result
}
