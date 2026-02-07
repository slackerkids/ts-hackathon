package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type GovRepository struct {
	pool *pgxpool.Pool
}

func NewGovRepository(pool *pgxpool.Pool) *GovRepository {
	return &GovRepository{pool: pool}
}

func (r *GovRepository) List(ctx context.Context) ([]model.GovMember, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, name, role_title, photo_url, contact_url, display_order, created_at
		 FROM gov_members ORDER BY display_order, id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.GovMember
	for rows.Next() {
		var g model.GovMember
		if err := rows.Scan(&g.ID, &g.Name, &g.RoleTitle, &g.PhotoURL, &g.ContactURL, &g.DisplayOrder, &g.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, g)
	}
	return list, rows.Err()
}

func (r *GovRepository) Create(ctx context.Context, g *model.GovMember) (*model.GovMember, error) {
	var result model.GovMember
	err := r.pool.QueryRow(ctx,
		`INSERT INTO gov_members (name, role_title, photo_url, contact_url, display_order)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, role_title, photo_url, contact_url, display_order, created_at`,
		g.Name, g.RoleTitle, g.PhotoURL, g.ContactURL, g.DisplayOrder,
	).Scan(&result.ID, &result.Name, &result.RoleTitle, &result.PhotoURL, &result.ContactURL, &result.DisplayOrder, &result.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *GovRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM gov_members WHERE id = $1`, id)
	return err
}
