package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/middleware"
	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/model"
	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/service"
	log "github.com/sirupsen/logrus"
)

// Handler holds a reference to the service layer
type Handler struct {
	svc *service.Service
}

func NewHandler(s *service.Service) *Handler {
	return &Handler{svc: s}
}

// RegisterRoutes wires all HTTP endpoints
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	// Auth (public)
	mux.HandleFunc("POST /api/register", h.Register)
	mux.HandleFunc("POST /api/login", h.Login)

	// Contributions (protected)
	mux.HandleFunc("GET /api/contributions", middleware.Auth(h.GetContributions))
	mux.HandleFunc("POST /api/contributions", middleware.Auth(middleware.AdminOnly(h.CreateContribution)))
	mux.HandleFunc("GET /api/contributions/{id}", middleware.Auth(h.GetContribution))
	mux.HandleFunc("PUT /api/contributions/{id}", middleware.Auth(middleware.AdminOnly(h.UpdateContribution)))
	mux.HandleFunc("DELETE /api/contributions/{id}", middleware.Auth(middleware.AdminOnly(h.DeleteContribution)))

	// Expenses (protected)
	mux.HandleFunc("GET /api/expenses", middleware.Auth(h.GetExpenses))
	mux.HandleFunc("POST /api/expenses", middleware.Auth(middleware.AdminOnly(h.CreateExpense)))
	mux.HandleFunc("GET /api/expenses/{id}", middleware.Auth(h.GetExpense))
	mux.HandleFunc("PUT /api/expenses/{id}", middleware.Auth(middleware.AdminOnly(h.UpdateExpense)))
	mux.HandleFunc("DELETE /api/expenses/{id}", middleware.Auth(middleware.AdminOnly(h.DeleteExpense)))

	// Dashboard & Analytics (protected)
	mux.HandleFunc("GET /api/dashboard", middleware.Auth(h.GetDashboard))
	mux.HandleFunc("GET /api/analytics/trend", middleware.Auth(h.GetMonthlyTrend))
	mux.HandleFunc("GET /api/analytics/categories", middleware.Auth(h.GetCategoryBreakdown))

	// Health check
	mux.HandleFunc("GET /health", h.Health)
}

// ---- Helpers ----

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Errorf("writeJSON: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func pathID(r *http.Request) (int, error) {
	return strconv.Atoi(r.PathValue("id"))
}

// ---- Health ----

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "time": time.Now().Format(time.RFC3339)})
}

// ---- Auth ----

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Username == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "username and password are required")
		return
	}
	user, err := h.svc.Register(r.Context(), req.Username, req.Password)
	if err != nil {
		log.Errorf("register: %v", err)
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, user)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	token, err := h.svc.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}

// ---- Contributions ----

func (h *Handler) GetContributions(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	list, err := h.svc.GetContributions(r.Context(), month)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []*model.Contribution{}
	}
	writeJSON(w, http.StatusOK, list)
}

func (h *Handler) CreateContribution(w http.ResponseWriter, r *http.Request) {
	var c model.Contribution
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.svc.CreateContribution(r.Context(), &c); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *Handler) GetContribution(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	c, err := h.svc.GetContribution(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handler) UpdateContribution(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var c model.Contribution
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	c.ID = id
	if err := h.svc.UpdateContribution(r.Context(), &c); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handler) DeleteContribution(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.DeleteContribution(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- Expenses ----

func (h *Handler) GetExpenses(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	category := r.URL.Query().Get("category")
	list, err := h.svc.GetExpenses(r.Context(), month, category)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if list == nil {
		list = []*model.Expense{}
	}
	writeJSON(w, http.StatusOK, list)
}

func (h *Handler) CreateExpense(w http.ResponseWriter, r *http.Request) {
	var e model.Expense
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.svc.CreateExpense(r.Context(), &e); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, e)
}

func (h *Handler) GetExpense(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	e, err := h.svc.GetExpense(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, e)
}

func (h *Handler) UpdateExpense(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var e model.Expense
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	e.ID = id
	if err := h.svc.UpdateExpense(r.Context(), &e); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, e)
}

func (h *Handler) DeleteExpense(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.DeleteExpense(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- Analytics ----

func (h *Handler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	summary, err := h.svc.GetDashboardSummary(r.Context(), month)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (h *Handler) GetMonthlyTrend(w http.ResponseWriter, r *http.Request) {
	trend, err := h.svc.GetMonthlyTrend(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if trend == nil {
		trend = []*model.MonthlyTrend{}
	}
	writeJSON(w, http.StatusOK, trend)
}

func (h *Handler) GetCategoryBreakdown(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	breakdown, err := h.svc.GetCategoryBreakdown(r.Context(), month)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if breakdown == nil {
		breakdown = []*model.CategoryBreakdown{}
	}
	writeJSON(w, http.StatusOK, breakdown)
}