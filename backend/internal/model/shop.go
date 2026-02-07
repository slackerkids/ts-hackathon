package model

import "time"

type ShopItem struct {
	ID         int64     `json:"id"`
	Name       string    `json:"name"`
	Description string   `json:"description,omitempty"`
	ImageURL   string    `json:"image_url,omitempty"`
	PriceCoins int       `json:"price_coins"`
	Stock      int       `json:"stock"`
	CreatedAt  time.Time `json:"created_at"`
}

type Purchase struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	ItemID     int64     `json:"item_id"`
	ItemName   string    `json:"item_name,omitempty"`
	PriceCoins int       `json:"price_coins"`
	CreatedAt  time.Time `json:"created_at"`
}
