package model

import "time"

// User represents an admin user
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

// Contribution represents a monthly contribution from a member
type Contribution struct {
	ID               int       `json:"id"`
	ContributorName  string    `json:"contributor_name"`
	Amount           float64   `json:"amount"`
	ContributionDate time.Time `json:"contribution_date"`
	Month            string    `json:"month"` // e.g. "2025-01"
	PaymentMethod    string    `json:"payment_method"`
	Notes            string    `json:"notes"`
	CreatedAt        time.Time `json:"created_at"`
}

// Expense represents an expense made from the collected funds
type Expense struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"`
	ExpenseDate time.Time `json:"expense_date"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
}

// DashboardSummary is the aggregated dashboard data
type DashboardSummary struct {
	TotalContributions   float64 `json:"total_contributions"`
	TotalExpenses        float64 `json:"total_expenses"`
	RemainingBudget      float64 `json:"remaining_budget"`
	ContributionsCount   int     `json:"contributions_count"`
	ExpensesCount        int     `json:"expenses_count"`
	AverageContribution  float64 `json:"average_contribution"`
}

// MonthlyTrend holds aggregated data for a single month
type MonthlyTrend struct {
	Month         string  `json:"month"`
	Contributions float64 `json:"contributions"`
	Expenses      float64 `json:"expenses"`
	Balance       float64 `json:"balance"`
}

// CategoryBreakdown holds expense totals per category
type CategoryBreakdown struct {
	Category string  `json:"category"`
	Total    float64 `json:"total"`
}
