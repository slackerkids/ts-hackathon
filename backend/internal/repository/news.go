package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type NewsRepository struct {
	pool *pgxpool.Pool
}

func NewNewsRepository(pool *pgxpool.Pool) *NewsRepository {
	return &NewsRepository{pool: pool}
}

func (r *NewsRepository) List(ctx context.Context, tag string) ([]model.News, error) {
	query := `SELECT id, title, content, image_url, tag, author_id, created_at, updated_at FROM news`
	args := []any{}

	if tag != "" {
		query += ` WHERE tag = $1`
		args = append(args, tag)
	}
	query += ` ORDER BY created_at DESC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.News
	for rows.Next() {
		var n model.News
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.ImageURL, &n.Tag, &n.AuthorID, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, n)
	}
	return list, rows.Err()
}

func (r *NewsRepository) GetByID(ctx context.Context, id int64) (*model.News, error) {
	var n model.News
	err := r.pool.QueryRow(ctx,
		`SELECT id, title, content, image_url, tag, author_id, created_at, updated_at FROM news WHERE id = $1`, id,
	).Scan(&n.ID, &n.Title, &n.Content, &n.ImageURL, &n.Tag, &n.AuthorID, &n.CreatedAt, &n.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *NewsRepository) Create(ctx context.Context, n *model.News) (*model.News, error) {
	var result model.News
	err := r.pool.QueryRow(ctx,
		`INSERT INTO news (title, content, image_url, tag, author_id)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, title, content, image_url, tag, author_id, created_at, updated_at`,
		n.Title, n.Content, n.ImageURL, n.Tag, n.AuthorID,
	).Scan(&result.ID, &result.Title, &result.Content, &result.ImageURL, &result.Tag, &result.AuthorID, &result.CreatedAt, &result.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *NewsRepository) Update(ctx context.Context, id int64, n *model.News) (*model.News, error) {
	var result model.News
	err := r.pool.QueryRow(ctx,
		`UPDATE news SET title = $1, content = $2, image_url = $3, tag = $4, updated_at = NOW()
		 WHERE id = $5
		 RETURNING id, title, content, image_url, tag, author_id, created_at, updated_at`,
		n.Title, n.Content, n.ImageURL, n.Tag, id,
	).Scan(&result.ID, &result.Title, &result.Content, &result.ImageURL, &result.Tag, &result.AuthorID, &result.CreatedAt, &result.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *NewsRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM news WHERE id = $1`, id)
	return err
}
