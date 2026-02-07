package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type ShopRepository struct {
	pool *pgxpool.Pool
}

func NewShopRepository(pool *pgxpool.Pool) *ShopRepository {
	return &ShopRepository{pool: pool}
}

func (r *ShopRepository) ListItems(ctx context.Context) ([]model.ShopItem, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, name, description, image_url, price_coins, stock, created_at
		 FROM shop_items ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []model.ShopItem
	for rows.Next() {
		var item model.ShopItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.ImageURL, &item.PriceCoins, &item.Stock, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *ShopRepository) GetItem(ctx context.Context, id int64) (*model.ShopItem, error) {
	var item model.ShopItem
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, description, image_url, price_coins, stock, created_at
		 FROM shop_items WHERE id = $1`, id).
		Scan(&item.ID, &item.Name, &item.Description, &item.ImageURL, &item.PriceCoins, &item.Stock, &item.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ShopRepository) CreateItem(ctx context.Context, item *model.ShopItem) (*model.ShopItem, error) {
	err := r.pool.QueryRow(ctx,
		`INSERT INTO shop_items (name, description, image_url, price_coins, stock)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, description, image_url, price_coins, stock, created_at`,
		item.Name, item.Description, item.ImageURL, item.PriceCoins, item.Stock).
		Scan(&item.ID, &item.Name, &item.Description, &item.ImageURL, &item.PriceCoins, &item.Stock, &item.CreatedAt)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *ShopRepository) DeleteItem(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM shop_items WHERE id = $1`, id)
	return err
}

// Buy atomically deducts coins from user, decrements stock, and creates a purchase record.
func (r *ShopRepository) Buy(ctx context.Context, userID, itemID int64) (*model.Purchase, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Lock and read the item
	var item model.ShopItem
	err = tx.QueryRow(ctx,
		`SELECT id, name, price_coins, stock FROM shop_items WHERE id = $1 FOR UPDATE`, itemID).
		Scan(&item.ID, &item.Name, &item.PriceCoins, &item.Stock)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("item not found")
	}
	if err != nil {
		return nil, err
	}

	// Check stock
	if item.Stock == 0 {
		return nil, fmt.Errorf("item out of stock")
	}

	// Check user coins
	var userCoins int
	err = tx.QueryRow(ctx, `SELECT coins FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&userCoins)
	if err != nil {
		return nil, err
	}
	if userCoins < item.PriceCoins {
		return nil, fmt.Errorf("not enough coins")
	}

	// Deduct coins
	_, err = tx.Exec(ctx, `UPDATE users SET coins = coins - $1, updated_at = NOW() WHERE id = $2`, item.PriceCoins, userID)
	if err != nil {
		return nil, err
	}

	// Decrement stock (only if not unlimited)
	if item.Stock > 0 {
		_, err = tx.Exec(ctx, `UPDATE shop_items SET stock = stock - 1 WHERE id = $1`, itemID)
		if err != nil {
			return nil, err
		}
	}

	// Create purchase record
	var purchase model.Purchase
	err = tx.QueryRow(ctx,
		`INSERT INTO purchases (user_id, item_id) VALUES ($1, $2) RETURNING id, user_id, item_id, created_at`,
		userID, itemID).
		Scan(&purchase.ID, &purchase.UserID, &purchase.ItemID, &purchase.CreatedAt)
	if err != nil {
		return nil, err
	}
	purchase.ItemName = item.Name
	purchase.PriceCoins = item.PriceCoins

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &purchase, nil
}
