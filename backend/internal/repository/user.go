package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

const userColumns = `id, telegram_id, username, first_name, last_name, photo_url, role, school_login, school_level, school_xp, audit_ratio, coins, created_at, updated_at`

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func scanUser(row pgx.Row) (*model.User, error) {
	var u model.User
	err := row.Scan(&u.ID, &u.TelegramID, &u.Username, &u.FirstName, &u.LastName, &u.PhotoURL, &u.Role,
		&u.SchoolLogin, &u.SchoolLevel, &u.SchoolXP, &u.AuditRatio, &u.Coins, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByTelegramID(ctx context.Context, telegramID int64) (*model.User, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM users WHERE telegram_id = $1`, telegramID,
	))
}

func (r *UserRepository) FindByID(ctx context.Context, id int64) (*model.User, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM users WHERE id = $1`, id,
	))
}

func (r *UserRepository) Upsert(ctx context.Context, u *model.User) (*model.User, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, role)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (telegram_id)
		 DO UPDATE SET
			username = EXCLUDED.username,
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			photo_url = EXCLUDED.photo_url,
			updated_at = NOW()
		 RETURNING `+userColumns,
		u.TelegramID, u.Username, u.FirstName, u.LastName, u.PhotoURL, u.Role,
	))
}

func (r *UserRepository) UpdateSchoolData(ctx context.Context, userID int64, schoolLogin string, schoolLevel int, schoolXP int64, auditRatio float64) (*model.User, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`UPDATE users SET
			role = 'student',
			school_login = $2,
			school_level = $3,
			school_xp = $4,
			audit_ratio = $5,
			updated_at = NOW()
		 WHERE id = $1
		 RETURNING `+userColumns,
		userID, schoolLogin, schoolLevel, schoolXP, auditRatio,
	))
}

func (r *UserRepository) PromoteToAdmin(ctx context.Context, userID int64) (*model.User, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = $1 RETURNING `+userColumns,
		userID,
	))
}

func (r *UserRepository) GetLeaderboard(ctx context.Context, limit int) ([]LeaderboardEntry, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, first_name, last_name, username, photo_url, coins, school_level
		 FROM users ORDER BY coins DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var entries []LeaderboardEntry
	rank := 1
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.UserID, &e.FirstName, &e.LastName, &e.Username, &e.PhotoURL, &e.Coins, &e.SchoolLevel); err != nil {
			return nil, err
		}
		e.Rank = rank
		rank++
		entries = append(entries, e)
	}
	return entries, nil
}

// LeaderboardEntry is a flat struct for leaderboard queries.
type LeaderboardEntry struct {
	Rank        int
	UserID      int64
	FirstName   string
	LastName    string
	Username    string
	PhotoURL    string
	Coins       int
	SchoolLevel int
}

func (r *UserRepository) ListAllTelegramIDs(ctx context.Context) ([]int64, error) {
	rows, err := r.pool.Query(ctx, `SELECT telegram_id FROM users`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}
