package service

import (
	"context"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type LeaderboardService struct {
	userRepo *repository.UserRepository
}

func NewLeaderboardService(userRepo *repository.UserRepository) *LeaderboardService {
	return &LeaderboardService{userRepo: userRepo}
}

func (s *LeaderboardService) GetTop(ctx context.Context, limit int) ([]repository.LeaderboardEntry, error) {
	return s.userRepo.GetLeaderboard(ctx, limit)
}
