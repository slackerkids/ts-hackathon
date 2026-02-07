package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
)

type AttendanceRepository struct {
	pool *pgxpool.Pool
}

func NewAttendanceRepository(pool *pgxpool.Pool) *AttendanceRepository {
	return &AttendanceRepository{pool: pool}
}

func (r *AttendanceRepository) CheckIn(ctx context.Context, a *model.Attendance) (*model.Attendance, error) {
	var result model.Attendance
	err := r.pool.QueryRow(ctx,
		`INSERT INTO attendance (user_id, event_name, coins_awarded)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, event_name, coins_awarded, created_at`,
		a.UserID, a.EventName, a.CoinsAwarded,
	).Scan(&result.ID, &result.UserID, &result.EventName, &result.CoinsAwarded, &result.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Add coins to user
	_, err = r.pool.Exec(ctx,
		`UPDATE users SET coins = coins + $1, updated_at = NOW() WHERE id = $2`,
		a.CoinsAwarded, a.UserID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update coins: %w", err)
	}

	return &result, nil
}

func (r *AttendanceRepository) ListByUserID(ctx context.Context, userID int64) ([]model.Attendance, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, event_name, coins_awarded, created_at FROM attendance WHERE user_id = $1 ORDER BY created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Attendance
	for rows.Next() {
		var a model.Attendance
		if err := rows.Scan(&a.ID, &a.UserID, &a.EventName, &a.CoinsAwarded, &a.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, rows.Err()
}
