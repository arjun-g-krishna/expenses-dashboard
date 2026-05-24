package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/model"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Repository is the interface the service depends on
type Repository interface {
	// User
	CreateUser(ctx context.Context, u *model.User) error
	GetUserByUsername(ctx context.Context, username string) (*model.User, error)
	// Contributions
	CreateContribution(ctx context.Context, c *model.Contribution) error
	GetContributions(ctx context.Context, month string) ([]*model.Contribution, error)
	GetContribution(ctx context.Context, id int) (*model.Contribution, error)
	UpdateContribution(ctx context.Context, c *model.Contribution) error
	DeleteContribution(ctx context.Context, id int) error
	// Expenses
	CreateExpense(ctx context.Context, e *model.Expense) error
	GetExpenses(ctx context.Context, month, category string) ([]*model.Expense, error)
	GetExpense(ctx context.Context, id int) (*model.Expense, error)
	UpdateExpense(ctx context.Context, e *model.Expense) error
	DeleteExpense(ctx context.Context, id int) error
	// Analytics
	GetDashboardSummary(ctx context.Context, month string) (*model.DashboardSummary, error)
	GetMonthlyTrend(ctx context.Context) ([]*model.MonthlyTrend, error)
	GetCategoryBreakdown(ctx context.Context, month string) ([]*model.CategoryBreakdown, error)
}

var jwtSecret = []byte("expenses-dashboard-secret-change-in-prod")

// Service encapsulates all business logic
type Service struct {
	repo Repository
}

func NewService(r Repository) *Service {
	return &Service{repo: r}
}

// ---- Auth ----

func (s *Service) Register(ctx context.Context, username, password string) (*model.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}
	u := &model.User{
		Username:     username,
		PasswordHash: string(hash),
		Role:         "admin",
	}
	if err := s.repo.CreateUser(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) Login(ctx context.Context, username, password string) (string, error) {
	u, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return "", errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}
	token, err := generateJWT(u)
	if err != nil {
		return "", fmt.Errorf("generating token: %w", err)
	}
	return token, nil
}

func generateJWT(u *model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  u.ID,
		"username": u.Username,
		"role":     u.Role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateJWT(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}

// ---- Contributions ----

func (s *Service) CreateContribution(ctx context.Context, c *model.Contribution) error {
	if c.ContributorName == "" {
		return errors.New("contributor_name is required")
	}
	if c.Amount <= 0 {
		return errors.New("amount must be positive")
	}
	if c.ContributionDate.IsZero() {
		return errors.New("contribution_date is required")
	}
	if c.Month == "" {
		c.Month = c.ContributionDate.Format("2006-01")
	}
	return s.repo.CreateContribution(ctx, c)
}

func (s *Service) GetContributions(ctx context.Context, month string) ([]*model.Contribution, error) {
	return s.repo.GetContributions(ctx, month)
}

func (s *Service) GetContribution(ctx context.Context, id int) (*model.Contribution, error) {
	return s.repo.GetContribution(ctx, id)
}

func (s *Service) UpdateContribution(ctx context.Context, c *model.Contribution) error {
	if c.ContributorName == "" {
		return errors.New("contributor_name is required")
	}
	if c.Amount <= 0 {
		return errors.New("amount must be positive")
	}
	if c.Month == "" && !c.ContributionDate.IsZero() {
		c.Month = c.ContributionDate.Format("2006-01")
	}
	return s.repo.UpdateContribution(ctx, c)
}

func (s *Service) DeleteContribution(ctx context.Context, id int) error {
	return s.repo.DeleteContribution(ctx, id)
}

// ---- Expenses ----

func (s *Service) CreateExpense(ctx context.Context, e *model.Expense) error {
	if e.Title == "" {
		return errors.New("title is required")
	}
	if e.Amount <= 0 {
		return errors.New("amount must be positive")
	}
	if e.Category == "" {
		return errors.New("category is required")
	}
	if e.ExpenseDate.IsZero() {
		return errors.New("expense_date is required")
	}
	return s.repo.CreateExpense(ctx, e)
}

func (s *Service) GetExpenses(ctx context.Context, month, category string) ([]*model.Expense, error) {
	return s.repo.GetExpenses(ctx, month, category)
}

func (s *Service) GetExpense(ctx context.Context, id int) (*model.Expense, error) {
	return s.repo.GetExpense(ctx, id)
}

func (s *Service) UpdateExpense(ctx context.Context, e *model.Expense) error {
	if e.Title == "" {
		return errors.New("title is required")
	}
	if e.Amount <= 0 {
		return errors.New("amount must be positive")
	}
	if e.Category == "" {
		return errors.New("category is required")
	}
	return s.repo.UpdateExpense(ctx, e)
}

func (s *Service) DeleteExpense(ctx context.Context, id int) error {
	return s.repo.DeleteExpense(ctx, id)
}

// ---- Analytics ----

func (s *Service) GetDashboardSummary(ctx context.Context, month string) (*model.DashboardSummary, error) {
	return s.repo.GetDashboardSummary(ctx, month)
}

func (s *Service) GetMonthlyTrend(ctx context.Context) ([]*model.MonthlyTrend, error) {
	return s.repo.GetMonthlyTrend(ctx)
}

func (s *Service) GetCategoryBreakdown(ctx context.Context, month string) ([]*model.CategoryBreakdown, error) {
	return s.repo.GetCategoryBreakdown(ctx, month)
}
