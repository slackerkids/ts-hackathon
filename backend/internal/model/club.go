package model

import "time"

type Club struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	Schedule    string    `json:"schedule"`
	MemberCount int       `json:"member_count"`
	IsMember    bool      `json:"is_member"`
	CreatedAt   time.Time `json:"created_at"`
}
