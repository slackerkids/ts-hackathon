package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type HackathonService struct {
	hackathonRepo *repository.HackathonRepository
}

func NewHackathonService(hackathonRepo *repository.HackathonRepository) *HackathonService {
	return &HackathonService{hackathonRepo: hackathonRepo}
}

func (s *HackathonService) List(ctx context.Context, status string) ([]model.Hackathon, error) {
	list, err := s.hackathonRepo.List(ctx, status)
	if err != nil {
		return nil, fmt.Errorf("failed to list hackathons: %w", err)
	}
	if list == nil {
		list = []model.Hackathon{}
	}
	return list, nil
}

func (s *HackathonService) GetByID(ctx context.Context, id int64) (*model.Hackathon, error) {
	h, err := s.hackathonRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get hackathon: %w", err)
	}
	return h, nil
}

func (s *HackathonService) Create(ctx context.Context, h *model.Hackathon) (*model.Hackathon, error) {
	result, err := s.hackathonRepo.Create(ctx, h)
	if err != nil {
		return nil, fmt.Errorf("failed to create hackathon: %w", err)
	}
	return result, nil
}

func (s *HackathonService) Delete(ctx context.Context, id int64) error {
	if err := s.hackathonRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete hackathon: %w", err)
	}
	return nil
}

func (s *HackathonService) Apply(ctx context.Context, hackathonID, userID int64, teamName string) (*model.HackathonApplication, error) {
	app := &model.HackathonApplication{
		HackathonID: hackathonID,
		UserID:      userID,
		TeamName:    teamName,
	}
	result, err := s.hackathonRepo.Apply(ctx, app)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			return nil, fmt.Errorf("already applied to this hackathon")
		}
		return nil, fmt.Errorf("failed to apply: %w", err)
	}
	return result, nil
}

func (s *HackathonService) ListApplications(ctx context.Context, hackathonID int64) ([]model.HackathonApplication, error) {
	list, err := s.hackathonRepo.ListApplications(ctx, hackathonID)
	if err != nil {
		return nil, fmt.Errorf("failed to list applications: %w", err)
	}
	if list == nil {
		list = []model.HackathonApplication{}
	}
	return list, nil
}
