package model

import "time"

type Hackathon struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	CreatedAt   time.Time `json:"created_at"`
}

type HackathonApplication struct {
	ID           int64     `json:"id"`
	HackathonID  int64     `json:"hackathon_id"`
	UserID       int64     `json:"user_id"`
	TeamName     string    `json:"team_name"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	User         *User     `json:"user,omitempty"`
}
