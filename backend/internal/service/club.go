package service

import (
	"context"
	"fmt"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type ClubService struct {
	clubRepo *repository.ClubRepository
}

func NewClubService(clubRepo *repository.ClubRepository) *ClubService {
	return &ClubService{clubRepo: clubRepo}
}

func (s *ClubService) List(ctx context.Context, userID *int64) ([]model.Club, error) {
	list, err := s.clubRepo.List(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list clubs: %w", err)
	}
	if list == nil {
		list = []model.Club{}
	}
	return list, nil
}

func (s *ClubService) GetByID(ctx context.Context, id int64, userID *int64) (*model.Club, error) {
	return s.clubRepo.GetByID(ctx, id, userID)
}

func (s *ClubService) Create(ctx context.Context, c *model.Club) (*model.Club, error) {
	return s.clubRepo.Create(ctx, c)
}

func (s *ClubService) Delete(ctx context.Context, id int64) error {
	return s.clubRepo.Delete(ctx, id)
}

func (s *ClubService) Join(ctx context.Context, clubID, userID int64) error {
	if err := s.clubRepo.Join(ctx, clubID, userID); err != nil {
		return fmt.Errorf("failed to join club: %w", err)
	}
	return nil
}

func (s *ClubService) Leave(ctx context.Context, clubID, userID int64) error {
	if err := s.clubRepo.Leave(ctx, clubID, userID); err != nil {
		return fmt.Errorf("failed to leave club: %w", err)
	}
	return nil
}
