package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type AttendanceService struct {
	attendanceRepo *repository.AttendanceRepository
}

func NewAttendanceService(attendanceRepo *repository.AttendanceRepository) *AttendanceService {
	return &AttendanceService{attendanceRepo: attendanceRepo}
}

func (s *AttendanceService) CheckIn(ctx context.Context, userID int64, eventName string, coins int) (*model.Attendance, error) {
	a := &model.Attendance{
		UserID:       userID,
		EventName:    eventName,
		CoinsAwarded: coins,
	}
	result, err := s.attendanceRepo.CheckIn(ctx, a)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique") {
			return nil, fmt.Errorf("already checked in for this event today")
		}
		return nil, fmt.Errorf("failed to check in: %w", err)
	}
	return result, nil
}

func (s *AttendanceService) History(ctx context.Context, userID int64) ([]model.Attendance, error) {
	list, err := s.attendanceRepo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendance: %w", err)
	}
	if list == nil {
		list = []model.Attendance{}
	}
	return list, nil
}
