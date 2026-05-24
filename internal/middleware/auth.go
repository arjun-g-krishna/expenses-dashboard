package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/Arjun-G-Krishna/expenses-dashboard/internal/service"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const ClaimsKey contextKey = "claims"

// Auth wraps a handler and validates the Bearer JWT token
func Auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := service.ValidateJWT(tokenStr)
		if err != nil {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), ClaimsKey, claims)
		next(w, r.WithContext(ctx))
	}
}

// AdminOnly wraps a handler and checks if the authenticated user is an admin.
// It assumes the Auth middleware has already run and populated the ClaimsKey.
func AdminOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(ClaimsKey).(jwt.MapClaims)
		if !ok {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		role, ok := claims["role"].(string)
		if !ok || role != "admin" {
			http.Error(w, `{"error":"forbidden: admin privileges required"}`, http.StatusForbidden)
			return
		}
		next(w, r)
	}
}
