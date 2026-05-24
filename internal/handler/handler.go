package handler

import (
	"net/http"
)

type Handler struct {
    service *service.Service
}

func NewHandler(s *service.Service) *Handler {
    return &Handler{service: s}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
    // Auth
    mux.HandleFunc("POST /api/register", h.Register)
    mux.HandleFunc("POST /api/login", h.Login)

    // Expenses
    mux.HandleFunc("POST /api/expenses", h.AuthMiddleware(h.CreateExpense))
    mux.HandleFunc("GET /api/expenses", h.AuthMiddleware(h.GetExpenses))
    mux.HandleFunc("GET /api/expenses/{id}", h.AuthMiddleware(h.GetExpense))
    mux.HandleFunc("PUT /api/expenses/{id}", h.AuthMiddleware(h.UpdateExpense))
    mux.HandleFunc("DELETE /api/expenses/{id}", h.AuthMiddleware(h.DeleteExpense))

    // Budgets, Reports, etc.
}