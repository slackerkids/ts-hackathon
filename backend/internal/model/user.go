package model

import "time"

type Role string

const (
	RoleGuest      Role = "guest"
	RoleStudent    Role = "student"
	RoleClubLeader Role = "club_leader"
	RoleAdmin      Role = "admin"
)

type User struct {
	ID          int64     `json:"id"`
	TelegramID  int64     `json:"telegram_id"`
	Username    string    `json:"username,omitempty"`
	FirstName   string    `json:"first_name,omitempty"`
	LastName    string    `json:"last_name,omitempty"`
	PhotoURL    string    `json:"photo_url,omitempty"`
	Role        Role      `json:"role"`
	SchoolLogin string    `json:"school_login,omitempty"`
	SchoolLevel int       `json:"school_level"`
	SchoolXP    int64     `json:"school_xp"`
	AuditRatio  float64   `json:"audit_ratio"`
	Coins       int       `json:"coins"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
