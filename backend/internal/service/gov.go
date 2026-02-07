package service

import (
	"context"
	"fmt"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type GovService struct {
	govRepo *repository.GovRepository
}

func NewGovService(govRepo *repository.GovRepository) *GovService {
	return &GovService{govRepo: govRepo}
}

func (s *GovService) List(ctx context.Context) ([]model.GovMember, error) {
	list, err := s.govRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list gov members: %w", err)
	}
	if list == nil {
		list = []model.GovMember{}
	}
	return list, nil
}

func (s *GovService) Create(ctx context.Context, g *model.GovMember) (*model.GovMember, error) {
	return s.govRepo.Create(ctx, g)
}

func (s *GovService) Delete(ctx context.Context, id int64) error {
	return s.govRepo.Delete(ctx, id)
}
