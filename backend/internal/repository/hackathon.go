package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type HackathonRepository struct {
	pool *pgxpool.Pool
}

func NewHackathonRepository(pool *pgxpool.Pool) *HackathonRepository {
	return &HackathonRepository{pool: pool}
}

func (r *HackathonRepository) List(ctx context.Context, status string) ([]model.Hackathon, error) {
	query := `SELECT id, title, description, status, start_date, end_date, created_at FROM hackathons`
	args := []any{}

	if status != "" {
		query += ` WHERE status = $1`
		args = append(args, status)
	}
	query += ` ORDER BY start_date DESC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Hackathon
	for rows.Next() {
		var h model.Hackathon
		if err := rows.Scan(&h.ID, &h.Title, &h.Description, &h.Status, &h.StartDate, &h.EndDate, &h.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, h)
	}
	return list, rows.Err()
}

func (r *HackathonRepository) GetByID(ctx context.Context, id int64) (*model.Hackathon, error) {
	var h model.Hackathon
	err := r.pool.QueryRow(ctx,
		`SELECT id, title, description, status, start_date, end_date, created_at FROM hackathons WHERE id = $1`, id,
	).Scan(&h.ID, &h.Title, &h.Description, &h.Status, &h.StartDate, &h.EndDate, &h.CreatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &h, nil
}

func (r *HackathonRepository) Create(ctx context.Context, h *model.Hackathon) (*model.Hackathon, error) {
	var result model.Hackathon
	err := r.pool.QueryRow(ctx,
		`INSERT INTO hackathons (title, description, status, start_date, end_date)
		 VALUES ($1, $2, 'active', $3, $4)
		 RETURNING id, title, description, status, start_date, end_date, created_at`,
		h.Title, h.Description, h.StartDate, h.EndDate,
	).Scan(&result.ID, &result.Title, &result.Description, &result.Status, &result.StartDate, &result.EndDate, &result.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *HackathonRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM hackathons WHERE id = $1`, id)
	return err
}

func (r *HackathonRepository) Apply(ctx context.Context, app *model.HackathonApplication) (*model.HackathonApplication, error) {
	var result model.HackathonApplication
	err := r.pool.QueryRow(ctx,
		`INSERT INTO hackathon_applications (hackathon_id, user_id, team_name)
		 VALUES ($1, $2, $3)
		 RETURNING id, hackathon_id, user_id, team_name, status, created_at`,
		app.HackathonID, app.UserID, app.TeamName,
	).Scan(&result.ID, &result.HackathonID, &result.UserID, &result.TeamName, &result.Status, &result.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *HackathonRepository) ListApplications(ctx context.Context, hackathonID int64) ([]model.HackathonApplication, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT ha.id, ha.hackathon_id, ha.user_id, ha.team_name, ha.status, ha.created_at,
		        u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.photo_url, u.role, u.created_at, u.updated_at
		 FROM hackathon_applications ha
		 JOIN users u ON u.id = ha.user_id
		 WHERE ha.hackathon_id = $1
		 ORDER BY ha.created_at DESC`, hackathonID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.HackathonApplication
	for rows.Next() {
		var a model.HackathonApplication
		var u model.User
		if err := rows.Scan(
			&a.ID, &a.HackathonID, &a.UserID, &a.TeamName, &a.Status, &a.CreatedAt,
			&u.ID, &u.TelegramID, &u.Username, &u.FirstName, &u.LastName, &u.PhotoURL, &u.Role, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, err
		}
		a.User = &u
		list = append(list, a)
	}
	return list, rows.Err()
}
