package service

import (
	"context"
	"fmt"
	"time"

	initdata "github.com/telegram-mini-apps/init-data-golang"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type AuthService struct {
	botToken string
	userRepo *repository.UserRepository
}

func NewAuthService(botToken string, userRepo *repository.UserRepository) *AuthService {
	return &AuthService{
		botToken: botToken,
		userRepo: userRepo,
	}
}

func (s *AuthService) AuthenticateWithInitData(ctx context.Context, rawInitData string) (*model.User, error) {
	// Validate the initData signature
	if err := initdata.Validate(rawInitData, s.botToken, 24*time.Hour); err != nil {
		return nil, fmt.Errorf("invalid init data: %w", err)
	}

	// Parse the validated init data
	parsed, err := initdata.Parse(rawInitData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse init data: %w", err)
	}

	if parsed.User.ID == 0 {
		return nil, fmt.Errorf("init data does not contain user information")
	}

	// Upsert user in database
	u := &model.User{
		TelegramID: parsed.User.ID,
		Username:   parsed.User.Username,
		FirstName:  parsed.User.FirstName,
		LastName:   parsed.User.LastName,
		PhotoURL:   parsed.User.PhotoURL,
		Role:       model.RoleGuest, // default role for new users; verified via school
	}

	// Check if user already exists to preserve their role
	existing, err := s.userRepo.FindByTelegramID(ctx, parsed.User.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	if existing != nil {
		u.Role = existing.Role
	}

	result, err := s.userRepo.Upsert(ctx, u)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert user: %w", err)
	}

	return result, nil
}
