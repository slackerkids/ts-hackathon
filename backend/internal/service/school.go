package service

import (
	"context"
	"fmt"

	"github.com/tomorrow-school/ts-hackathon/backend/internal/gateway"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/model"
	"github.com/tomorrow-school/ts-hackathon/backend/internal/repository"
)

type SchoolService struct {
	schoolGW *gateway.SchoolGateway
	userRepo *repository.UserRepository
}

func NewSchoolService(schoolGW *gateway.SchoolGateway, userRepo *repository.UserRepository) *SchoolService {
	return &SchoolService{schoolGW: schoolGW, userRepo: userRepo}
}

func (s *SchoolService) VerifyStudent(ctx context.Context, userID int64, username, password string) (*model.User, error) {
	// 1. Authenticate with school
	jwt, err := s.schoolGW.Authenticate(username, password)
	if err != nil {
		return nil, fmt.Errorf("school authentication failed: %w", err)
	}

	// 2. Fetch profile
	profile, err := s.schoolGW.FetchProfile(jwt)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch school profile: %w", err)
	}

	// 3. Fetch level
	level, err := s.schoolGW.FetchLevel(jwt, profile.Login)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch school level: %w", err)
	}

	// 4. Fetch total XP
	totalXP, err := s.schoolGW.FetchXP(jwt, profile.ID)
	if err != nil {
		// Not critical, continue with 0
		totalXP = 0
	}

	// 5. Update user in DB
	user, err := s.userRepo.UpdateSchoolData(ctx, userID, profile.Login, level.Level, totalXP, level.AuditRatio)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}
