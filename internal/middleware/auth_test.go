package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestAdminOnly_Middleware(t *testing.T) {
	// A simple handler that returns 200 OK
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	tests := []struct {
		name           string
		claims         jwt.MapClaims
		setClaims      bool
		expectedStatus int
	}{
		{
			name: "Admin role is allowed",
			claims: jwt.MapClaims{
				"role": "admin",
			},
			setClaims:      true,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Viewer role is forbidden",
			claims: jwt.MapClaims{
				"role": "viewer",
			},
			setClaims:      true,
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Missing claims is unauthorized",
			claims:         nil,
			setClaims:      false,
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "Invalid role type is forbidden",
			claims: jwt.MapClaims{
				"role": 123,
			},
			setClaims:      true,
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := http.NewRequest("POST", "/api/expenses", nil)
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}

			if tt.setClaims {
				ctx := context.WithValue(req.Context(), ClaimsKey, tt.claims)
				req = req.WithContext(ctx)
			}

			rr := httptest.NewRecorder()
			handler := AdminOnly(dummyHandler)
			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}
