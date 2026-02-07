package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) FindByTelegramID(ctx context.Context, telegramID int64) (*model.User, error) {
	var u model.User
	err := r.pool.QueryRow(ctx,
		`SELECT id, telegram_id, username, first_name, last_name, photo_url, role, created_at, updated_at
		 FROM users WHERE telegram_id = $1`, telegramID,
	).Scan(&u.ID, &u.TelegramID, &u.Username, &u.FirstName, &u.LastName, &u.PhotoURL, &u.Role, &u.CreatedAt, &u.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) Upsert(ctx context.Context, u *model.User) (*model.User, error) {
	var result model.User
	err := r.pool.QueryRow(ctx,
		`INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, role)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (telegram_id)
		 DO UPDATE SET
			username = EXCLUDED.username,
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			photo_url = EXCLUDED.photo_url,
			updated_at = NOW()
		 RETURNING id, telegram_id, username, first_name, last_name, photo_url, role, created_at, updated_at`,
		u.TelegramID, u.Username, u.FirstName, u.LastName, u.PhotoURL, u.Role,
	).Scan(&result.ID, &result.TelegramID, &result.Username, &result.FirstName, &result.LastName, &result.PhotoURL, &result.Role, &result.CreatedAt, &result.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &result, nil
}
