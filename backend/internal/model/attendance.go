package model

import "time"

type Attendance struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	EventName    string    `json:"event_name"`
	CoinsAwarded int       `json:"coins_awarded"`
	CreatedAt    time.Time `json:"created_at"`
}
