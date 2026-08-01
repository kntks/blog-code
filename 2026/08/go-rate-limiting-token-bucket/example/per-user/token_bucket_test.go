package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHTTPMiddlewareLimitsEachUserIndependently(t *testing.T) {
	limiter := NewTokenBucketLimiter(0, 2, time.Hour)
	defer limiter.Close()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	handler := limiter.HTTPMiddleware(next)

	for i := 0; i < 2; i++ {
		request := httptest.NewRequest(http.MethodGet, "/", nil)
		request.Header.Set("X-User-ID", "alice")
		response := httptest.NewRecorder()

		handler.ServeHTTP(response, request)
		if response.Code != http.StatusNoContent {
			t.Fatalf("alice request %d: got status %d, want %d", i+1, response.Code, http.StatusNoContent)
		}
	}

	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("X-User-ID", "alice")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusTooManyRequests {
		t.Fatalf("alice over-limit request: got status %d, want %d", response.Code, http.StatusTooManyRequests)
	}

	request = httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("X-User-ID", "bob")
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNoContent {
		t.Fatalf("bob request: got status %d, want %d", response.Code, http.StatusNoContent)
	}
}

func TestHTTPMiddlewareRequiresUserID(t *testing.T) {
	limiter := NewTokenBucketLimiter(1, 1, time.Hour)
	defer limiter.Close()

	handler := limiter.HTTPMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("next handler should not be called without a user ID")
	}))

	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("missing user ID: got status %d, want %d", response.Code, http.StatusUnauthorized)
	}
}
