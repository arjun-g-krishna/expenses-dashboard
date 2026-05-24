package repository

import (
	"context"
	"fmt"

	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/model"
)

// ---- User ----

func (r *PostgresRepo) CreateUser(ctx context.Context, u *model.User) error {
	return r.pool.QueryRow(ctx,
		`INSERT INTO users (username, password_hash, role)
		 VALUES ($1, $2, $3)
		 RETURNING id, created_at`,
		u.Username, u.PasswordHash, u.Role,
	).Scan(&u.ID, &u.CreatedAt)
}

func (r *PostgresRepo) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	u := &model.User{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, username, password_hash, role, created_at
		 FROM users WHERE username = $1`,
		username,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

// ---- Contributions ----

func (r *PostgresRepo) CreateContribution(ctx context.Context, c *model.Contribution) error {
	return r.pool.QueryRow(ctx,
		`INSERT INTO contributions (contributor_name, amount, contribution_date, month, payment_method, notes)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, created_at`,
		c.ContributorName, c.Amount, c.ContributionDate, c.Month, c.PaymentMethod, c.Notes,
	).Scan(&c.ID, &c.CreatedAt)
}

func (r *PostgresRepo) GetContributions(ctx context.Context, month string) ([]*model.Contribution, error) {
	query := `SELECT id, contributor_name, amount, contribution_date, month, payment_method, notes, created_at
	          FROM contributions`
	args := []any{}

	if month != "" {
		query += ` WHERE month = $1`
		args = append(args, month)
	}
	query += ` ORDER BY contribution_date DESC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.Contribution
	for rows.Next() {
		c := &model.Contribution{}
		if err := rows.Scan(&c.ID, &c.ContributorName, &c.Amount, &c.ContributionDate,
			&c.Month, &c.PaymentMethod, &c.Notes, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *PostgresRepo) GetContribution(ctx context.Context, id int) (*model.Contribution, error) {
	c := &model.Contribution{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, contributor_name, amount, contribution_date, month, payment_method, notes, created_at
		 FROM contributions WHERE id = $1`, id,
	).Scan(&c.ID, &c.ContributorName, &c.Amount, &c.ContributionDate,
		&c.Month, &c.PaymentMethod, &c.Notes, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *PostgresRepo) UpdateContribution(ctx context.Context, c *model.Contribution) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE contributions
		 SET contributor_name=$1, amount=$2, contribution_date=$3, month=$4, payment_method=$5, notes=$6
		 WHERE id=$7`,
		c.ContributorName, c.Amount, c.ContributionDate, c.Month, c.PaymentMethod, c.Notes, c.ID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("contribution %d not found", c.ID)
	}
	return nil
}

func (r *PostgresRepo) DeleteContribution(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM contributions WHERE id=$1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("contribution %d not found", id)
	}
	return nil
}

// ---- Expenses ----

func (r *PostgresRepo) CreateExpense(ctx context.Context, e *model.Expense) error {
	return r.pool.QueryRow(ctx,
		`INSERT INTO expenses (title, amount, category, expense_date, notes)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, created_at`,
		e.Title, e.Amount, e.Category, e.ExpenseDate, e.Notes,
	).Scan(&e.ID, &e.CreatedAt)
}

func (r *PostgresRepo) GetExpenses(ctx context.Context, month, category string) ([]*model.Expense, error) {
	query := `SELECT id, title, amount, category, expense_date, notes, created_at
	          FROM expenses WHERE 1=1`
	args := []any{}
	i := 1

	if month != "" {
		query += fmt.Sprintf(` AND to_char(expense_date, 'YYYY-MM') = $%d`, i)
		args = append(args, month)
		i++
	}
	if category != "" {
		query += fmt.Sprintf(` AND category = $%d`, i)
		args = append(args, category)
		i++
	}
	query += ` ORDER BY expense_date DESC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.Expense
	for rows.Next() {
		e := &model.Expense{}
		if err := rows.Scan(&e.ID, &e.Title, &e.Amount, &e.Category, &e.ExpenseDate, &e.Notes, &e.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, e)
	}
	return list, rows.Err()
}

func (r *PostgresRepo) GetExpense(ctx context.Context, id int) (*model.Expense, error) {
	e := &model.Expense{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, title, amount, category, expense_date, notes, created_at
		 FROM expenses WHERE id=$1`, id,
	).Scan(&e.ID, &e.Title, &e.Amount, &e.Category, &e.ExpenseDate, &e.Notes, &e.CreatedAt)
	if err != nil {
		return nil, err
	}
	return e, nil
}

func (r *PostgresRepo) UpdateExpense(ctx context.Context, e *model.Expense) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE expenses
		 SET title=$1, amount=$2, category=$3, expense_date=$4, notes=$5
		 WHERE id=$6`,
		e.Title, e.Amount, e.Category, e.ExpenseDate, e.Notes, e.ID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("expense %d not found", e.ID)
	}
	return nil
}

func (r *PostgresRepo) DeleteExpense(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM expenses WHERE id=$1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("expense %d not found", id)
	}
	return nil
}

// ---- Analytics ----

func (r *PostgresRepo) GetDashboardSummary(ctx context.Context, month string) (*model.DashboardSummary, error) {
	s := &model.DashboardSummary{}

	monthFilter := ""
	if month != "" {
		monthFilter = month
	}

	// Contributions
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount),0), COUNT(*)
		FROM contributions
		WHERE ($1 = '' OR month = $1)
	`, monthFilter).Scan(&s.TotalContributions, &s.ContributionsCount)
	if err != nil {
		return nil, err
	}

	// Expenses
	err = r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount),0), COUNT(*)
		FROM expenses
		WHERE ($1 = '' OR to_char(expense_date,'YYYY-MM') = $1)
	`, monthFilter).Scan(&s.TotalExpenses, &s.ExpensesCount)
	if err != nil {
		return nil, err
	}

	s.RemainingBudget = s.TotalContributions - s.TotalExpenses
	if s.ContributionsCount > 0 {
		s.AverageContribution = s.TotalContributions / float64(s.ContributionsCount)
	}
	return s, nil
}

func (r *PostgresRepo) GetMonthlyTrend(ctx context.Context) ([]*model.MonthlyTrend, error) {
	rows, err := r.pool.Query(ctx, `
		WITH months AS (
			SELECT DISTINCT month FROM contributions
			UNION
			SELECT DISTINCT to_char(expense_date,'YYYY-MM') FROM expenses
		),
		c AS (
			SELECT month, COALESCE(SUM(amount),0) AS total FROM contributions GROUP BY month
		),
		e AS (
			SELECT to_char(expense_date,'YYYY-MM') AS month, COALESCE(SUM(amount),0) AS total
			FROM expenses GROUP BY 1
		)
		SELECT m.month,
		       COALESCE(c.total,0),
		       COALESCE(e.total,0),
		       COALESCE(c.total,0) - COALESCE(e.total,0)
		FROM months m
		LEFT JOIN c ON c.month = m.month
		LEFT JOIN e ON e.month = m.month
		ORDER BY m.month ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.MonthlyTrend
	for rows.Next() {
		t := &model.MonthlyTrend{}
		if err := rows.Scan(&t.Month, &t.Contributions, &t.Expenses, &t.Balance); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *PostgresRepo) GetCategoryBreakdown(ctx context.Context, month string) ([]*model.CategoryBreakdown, error) {
	query := `
		SELECT category, COALESCE(SUM(amount),0) AS total
		FROM expenses
		WHERE ($1 = '' OR to_char(expense_date,'YYYY-MM') = $1)
		GROUP BY category
		ORDER BY total DESC
	`
	rows, err := r.pool.Query(ctx, query, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.CategoryBreakdown
	for rows.Next() {
		cb := &model.CategoryBreakdown{}
		if err := rows.Scan(&cb.Category, &cb.Total); err != nil {
			return nil, err
		}
		list = append(list, cb)
	}
	return list, rows.Err()
}
