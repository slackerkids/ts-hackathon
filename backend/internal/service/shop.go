package service

import (
	"context"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type ShopService struct {
	repo *repository.ShopRepository
}

func NewShopService(repo *repository.ShopRepository) *ShopService {
	return &ShopService{repo: repo}
}

func (s *ShopService) ListItems(ctx context.Context) ([]model.ShopItem, error) {
	return s.repo.ListItems(ctx)
}

func (s *ShopService) CreateItem(ctx context.Context, item *model.ShopItem) (*model.ShopItem, error) {
	return s.repo.CreateItem(ctx, item)
}

func (s *ShopService) DeleteItem(ctx context.Context, id int64) error {
	return s.repo.DeleteItem(ctx, id)
}

func (s *ShopService) Buy(ctx context.Context, userID, itemID int64) (*model.Purchase, error) {
	return s.repo.Buy(ctx, userID, itemID)
}
