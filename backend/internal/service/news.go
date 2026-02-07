package service

import (
	"context"
	"fmt"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type NewsService struct {
	newsRepo *repository.NewsRepository
}

func NewNewsService(newsRepo *repository.NewsRepository) *NewsService {
	return &NewsService{newsRepo: newsRepo}
}

func (s *NewsService) List(ctx context.Context, tag string) ([]model.News, error) {
	list, err := s.newsRepo.List(ctx, tag)
	if err != nil {
		return nil, fmt.Errorf("failed to list news: %w", err)
	}
	if list == nil {
		list = []model.News{}
	}
	return list, nil
}

func (s *NewsService) GetByID(ctx context.Context, id int64) (*model.News, error) {
	n, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}
	return n, nil
}

func (s *NewsService) Create(ctx context.Context, n *model.News) (*model.News, error) {
	result, err := s.newsRepo.Create(ctx, n)
	if err != nil {
		return nil, fmt.Errorf("failed to create news: %w", err)
	}
	return result, nil
}

func (s *NewsService) Update(ctx context.Context, id int64, n *model.News) (*model.News, error) {
	result, err := s.newsRepo.Update(ctx, id, n)
	if err != nil {
		return nil, fmt.Errorf("failed to update news: %w", err)
	}
	return result, nil
}

func (s *NewsService) Delete(ctx context.Context, id int64) error {
	if err := s.newsRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete news: %w", err)
	}
	return nil
}
