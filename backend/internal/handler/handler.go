package handler

import (
	"encoding/json"
	"net/http"

	"github.com/tomorrow-school/ts-hackathon/backend/generated"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/middleware"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/service"
)

type Handler struct {
	authService       *service.AuthService
	schoolService     *service.SchoolService
	newsService       *service.NewsService
	hackathonService  *service.HackathonService
	attendanceService *service.AttendanceService
	clubService       *service.ClubService
	govService        *service.GovService
}

var _ generated.ServerInterface = (*Handler)(nil)

func NewHandler(
	authService *service.AuthService,
	schoolService *service.SchoolService,
	newsService *service.NewsService,
	hackathonService *service.HackathonService,
	attendanceService *service.AttendanceService,
	clubService *service.ClubService,
	govService *service.GovService,
) *Handler {
	return &Handler{
		authService:       authService,
		schoolService:     schoolService,
		newsService:       newsService,
		hackathonService:  hackathonService,
		attendanceService: attendanceService,
		clubService:       clubService,
		govService:        govService,
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

func (h *Handler) AuthSchool(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}
	var req generated.SchoolAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}
	updated, err := h.schoolService.VerifyStudent(r.Context(), user.ID, req.Username, req.Password)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, userToGenerated(updated))
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
	n := &model.News{Title: req.Title, Content: req.Content, Tag: req.Tag, AuthorID: &user.ID}
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
	n := &model.News{Title: req.Title, Content: req.Content, Tag: req.Tag}
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
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
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
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	var req generated.HackathonCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}
	result, err := h.hackathonService.Create(r.Context(), &model.Hackathon{Title: req.Title, Description: req.Description, StartDate: req.StartDate, EndDate: req.EndDate})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, hackathonToGenerated(result))
}

func (h *Handler) DeleteHackathon(w http.ResponseWriter, r *http.Request, id int64) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
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
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
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

// ─── Attendance ──────────────────────────────────────────────────────────────

func (h *Handler) AttendanceCheckIn(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	var req generated.CheckInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}
	a, err := h.attendanceService.CheckIn(r.Context(), req.UserId, req.EventName, req.Coins)
	if err != nil {
		if err.Error() == "already checked in for this event today" {
			writeJSON(w, http.StatusConflict, generated.ErrorResponse{Error: err.Error()})
			return
		}
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, attendanceToGenerated(a))
}

func (h *Handler) AttendanceHistory(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}
	list, err := h.attendanceService.History(r.Context(), user.ID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.Attendance, len(list))
	for i, a := range list {
		result[i] = attendanceToGenerated(&a)
	}
	writeJSON(w, http.StatusOK, result)
}

// ─── Clubs ───────────────────────────────────────────────────────────────────

func (h *Handler) ListClubs(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	var userID *int64
	if user != nil {
		userID = &user.ID
	}
	list, err := h.clubService.List(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.Club, len(list))
	for i, c := range list {
		result[i] = clubToGenerated(&c)
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) GetClub(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	var userID *int64
	if user != nil {
		userID = &user.ID
	}
	c, err := h.clubService.GetByID(r.Context(), id, userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	if c == nil {
		writeJSON(w, http.StatusNotFound, generated.ErrorResponse{Error: "club not found"})
		return
	}
	writeJSON(w, http.StatusOK, clubToGenerated(c))
}

func (h *Handler) CreateClub(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	var req generated.ClubCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}
	c := &model.Club{Name: req.Name}
	if req.Description != nil {
		c.Description = *req.Description
	}
	if req.ImageUrl != nil {
		c.ImageURL = *req.ImageUrl
	}
	if req.Schedule != nil {
		c.Schedule = *req.Schedule
	}
	result, err := h.clubService.Create(r.Context(), c)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, clubToGenerated(result))
}

func (h *Handler) DeleteClub(w http.ResponseWriter, r *http.Request, id int64) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	if err := h.clubService.Delete(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) JoinClub(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}
	if err := h.clubService.Join(r.Context(), id, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	c, _ := h.clubService.GetByID(r.Context(), id, &user.ID)
	if c != nil {
		writeJSON(w, http.StatusOK, clubToGenerated(c))
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *Handler) LeaveClub(w http.ResponseWriter, r *http.Request, id int64) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, generated.ErrorResponse{Error: "unauthorized"})
		return
	}
	if err := h.clubService.Leave(r.Context(), id, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─── Gov ─────────────────────────────────────────────────────────────────────

func (h *Handler) ListGovMembers(w http.ResponseWriter, r *http.Request) {
	list, err := h.govService.List(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	result := make([]generated.GovMember, len(list))
	for i, g := range list {
		result[i] = govToGenerated(&g)
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) CreateGovMember(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	var req generated.GovMemberCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, generated.ErrorResponse{Error: "invalid request body"})
		return
	}
	g := &model.GovMember{Name: req.Name, RoleTitle: req.RoleTitle}
	if req.PhotoUrl != nil {
		g.PhotoURL = *req.PhotoUrl
	}
	if req.ContactUrl != nil {
		g.ContactURL = *req.ContactUrl
	}
	if req.DisplayOrder != nil {
		g.DisplayOrder = *req.DisplayOrder
	}
	result, err := h.govService.Create(r.Context(), g)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, govToGenerated(result))
}

func (h *Handler) DeleteGovMember(w http.ResponseWriter, r *http.Request, id int64) {
	if !requireAdmin(w, middleware.UserFromContext(r.Context())) {
		return
	}
	if err := h.govService.Delete(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, generated.ErrorResponse{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
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

func intPtr(n int) *int {
	return &n
}

func boolPtr(b bool) *bool {
	return &b
}

func float32Ptr(f float64) *float32 {
	v := float32(f)
	return &v
}

func userToGenerated(u *model.User) generated.User {
	return generated.User{
		Id:          u.ID,
		TelegramId:  u.TelegramID,
		Username:    strPtr(u.Username),
		FirstName:   strPtr(u.FirstName),
		LastName:    strPtr(u.LastName),
		PhotoUrl:    strPtr(u.PhotoURL),
		Role:        generated.UserRole(u.Role),
		SchoolLogin: strPtr(u.SchoolLogin),
		SchoolLevel: intPtr(u.SchoolLevel),
		SchoolXp:    &u.SchoolXP,
		AuditRatio:  float32Ptr(u.AuditRatio),
		Coins:       intPtr(u.Coins),
		CreatedAt:   &u.CreatedAt,
		UpdatedAt:   &u.UpdatedAt,
	}
}

func newsToGenerated(n *model.News) generated.News {
	return generated.News{
		Id: n.ID, Title: n.Title, Content: n.Content, ImageUrl: strPtr(n.ImageURL),
		Tag: n.Tag, AuthorId: n.AuthorID, CreatedAt: n.CreatedAt, UpdatedAt: &n.UpdatedAt,
	}
}

func hackathonToGenerated(h *model.Hackathon) generated.Hackathon {
	return generated.Hackathon{
		Id: h.ID, Title: h.Title, Description: h.Description,
		Status: generated.HackathonStatus(h.Status), StartDate: h.StartDate,
		EndDate: h.EndDate, CreatedAt: &h.CreatedAt,
	}
}

func applicationToGenerated(a *model.HackathonApplication) generated.HackathonApplication {
	r := generated.HackathonApplication{
		Id: a.ID, HackathonId: a.HackathonID, UserId: a.UserID,
		TeamName: strPtr(a.TeamName), Status: a.Status, CreatedAt: &a.CreatedAt,
	}
	if a.User != nil {
		u := userToGenerated(a.User)
		r.User = &u
	}
	return r
}

func attendanceToGenerated(a *model.Attendance) generated.Attendance {
	return generated.Attendance{
		Id: a.ID, UserId: a.UserID, EventName: a.EventName,
		CoinsAwarded: a.CoinsAwarded, CreatedAt: &a.CreatedAt,
	}
}

func clubToGenerated(c *model.Club) generated.Club {
	return generated.Club{
		Id: c.ID, Name: c.Name, Description: strPtr(c.Description),
		ImageUrl: strPtr(c.ImageURL), Schedule: strPtr(c.Schedule),
		MemberCount: intPtr(c.MemberCount), IsMember: boolPtr(c.IsMember),
		CreatedAt: &c.CreatedAt,
	}
}

func govToGenerated(g *model.GovMember) generated.GovMember {
	return generated.GovMember{
		Id: g.ID, Name: g.Name, RoleTitle: g.RoleTitle,
		PhotoUrl: strPtr(g.PhotoURL), ContactUrl: strPtr(g.ContactURL),
		DisplayOrder: intPtr(g.DisplayOrder), CreatedAt: &g.CreatedAt,
	}
}
