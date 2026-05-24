package service

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/model"
)

// stubRepo satisfies Repository for unit tests (no database).
type stubRepo struct{}

func (stubRepo) CreateUser(context.Context, *model.User) error { return nil }
func (stubRepo) GetUserByUsername(context.Context, string) (*model.User, error) {
	return nil, nil
}
func (stubRepo) CreateContribution(context.Context, *model.Contribution) error { return nil }
func (stubRepo) GetContributions(context.Context, string) ([]*model.Contribution, error) {
	return nil, nil
}
func (stubRepo) GetContribution(context.Context, int) (*model.Contribution, error) {
	return nil, nil
}
func (stubRepo) UpdateContribution(context.Context, *model.Contribution) error { return nil }
func (stubRepo) DeleteContribution(context.Context, int) error                 { return nil }
func (stubRepo) CreateExpense(context.Context, *model.Expense) error           { return nil }
func (stubRepo) GetExpenses(context.Context, string, string) ([]*model.Expense, error) {
	return nil, nil
}
func (stubRepo) GetExpense(context.Context, int) (*model.Expense, error) { return nil, nil }
func (stubRepo) UpdateExpense(context.Context, *model.Expense) error     { return nil }
func (stubRepo) DeleteExpense(context.Context, int) error                { return nil }
func (stubRepo) GetDashboardSummary(context.Context, string) (*model.DashboardSummary, error) {
	return nil, nil
}
func (stubRepo) GetMonthlyTrend(context.Context) ([]*model.MonthlyTrend, error) {
	return nil, nil
}
func (stubRepo) GetCategoryBreakdown(context.Context, string) ([]*model.CategoryBreakdown, error) {
	return nil, nil
}

func loadContributionsFixture(t *testing.T) []model.Contribution {
	t.Helper()
	path := filepath.Join("..", "..", "tests", "fixtures", "contributions.json")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	var list []model.Contribution
	if err := json.Unmarshal(data, &list); err != nil {
		t.Fatalf("parse fixture: %v", err)
	}
	return list
}

func TestCreateContribution_validationFromFixture(t *testing.T) {
	svc := NewService(stubRepo{})
	ctx := context.Background()
	fixtures := loadContributionsFixture(t)

	if len(fixtures) == 0 {
		t.Fatal("expected sample contributions in tests/fixtures")
	}

	sample := fixtures[0]
	if err := svc.CreateContribution(ctx, &sample); err != nil {
		t.Fatalf("valid fixture row should pass validation: %v", err)
	}

	bad := sample
	bad.ContributorName = ""
	if err := svc.CreateContribution(ctx, &bad); err == nil {
		t.Fatal("expected error for empty contributor_name")
	}

	bad = sample
	bad.Amount = 0
	if err := svc.CreateContribution(ctx, &bad); err == nil {
		t.Fatal("expected error for zero amount")
	}
}

func TestCreateContribution_derivesMonthFromDate(t *testing.T) {
	svc := NewService(stubRepo{})
	ctx := context.Background()

	c := &model.Contribution{
		ContributorName:  "Test User",
		Amount:           100,
		ContributionDate: time.Date(2026, 5, 15, 0, 0, 0, 0, time.UTC),
	}
	if err := svc.CreateContribution(ctx, c); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.Month != "2026-05" {
		t.Fatalf("expected month 2026-05, got %q", c.Month)
	}
}

func TestFixture_expenseCount(t *testing.T) {
	path := filepath.Join("..", "..", "tests", "fixtures", "expenses.json")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	var list []model.Expense
	if err := json.Unmarshal(data, &list); err != nil {
		t.Fatalf("parse fixture: %v", err)
	}
	if len(list) != 10 {
		t.Fatalf("expected 10 sample expenses, got %d", len(list))
	}
}
