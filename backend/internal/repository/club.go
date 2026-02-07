package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type ClubRepository struct {
	pool *pgxpool.Pool
}

func NewClubRepository(pool *pgxpool.Pool) *ClubRepository {
	return &ClubRepository{pool: pool}
}

func (r *ClubRepository) List(ctx context.Context, userID *int64) ([]model.Club, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT c.id, c.name, c.description, c.image_url, c.schedule, c.created_at,
		        (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) AS member_count,
		        COALESCE((SELECT true FROM club_members WHERE club_id = c.id AND user_id = $1), false) AS is_member
		 FROM clubs c ORDER BY c.name`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Club
	for rows.Next() {
		var c model.Club
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.ImageURL, &c.Schedule, &c.CreatedAt, &c.MemberCount, &c.IsMember); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *ClubRepository) GetByID(ctx context.Context, id int64, userID *int64) (*model.Club, error) {
	var c model.Club
	err := r.pool.QueryRow(ctx,
		`SELECT c.id, c.name, c.description, c.image_url, c.schedule, c.created_at,
		        (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) AS member_count,
		        COALESCE((SELECT true FROM club_members WHERE club_id = c.id AND user_id = $2), false) AS is_member
		 FROM clubs c WHERE c.id = $1`, id, userID,
	).Scan(&c.ID, &c.Name, &c.Description, &c.ImageURL, &c.Schedule, &c.CreatedAt, &c.MemberCount, &c.IsMember)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ClubRepository) Create(ctx context.Context, c *model.Club) (*model.Club, error) {
	var result model.Club
	err := r.pool.QueryRow(ctx,
		`INSERT INTO clubs (name, description, image_url, schedule)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, description, image_url, schedule, created_at`,
		c.Name, c.Description, c.ImageURL, c.Schedule,
	).Scan(&result.ID, &result.Name, &result.Description, &result.ImageURL, &result.Schedule, &result.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *ClubRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM clubs WHERE id = $1`, id)
	return err
}

func (r *ClubRepository) Join(ctx context.Context, clubID, userID int64) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO club_members (club_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		clubID, userID,
	)
	return err
}

func (r *ClubRepository) Leave(ctx context.Context, clubID, userID int64) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM club_members WHERE club_id = $1 AND user_id = $2`,
		clubID, userID,
	)
	return err
}
