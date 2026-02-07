package model

import "time"

type GovMember struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	RoleTitle    string    `json:"role_title"`
	PhotoURL     string    `json:"photo_url"`
	ContactURL   string    `json:"contact_url"`
	DisplayOrder int       `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}
