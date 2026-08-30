package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestLocalLimiterEnforcesLimitPerAPIKeyAndWindow(t *testing.T) {
	limiter := newLocalLimiter(2, 60*time.Second)
	firstWindow := time.Unix(120, 0)

	for i := 0; i < 2; i++ {
		result, err := limiter.allow(context.Background(), "key-a", firstWindow)
		if err != nil {
			t.Fatal(err)
		}
		if !result.allowed {
			t.Fatalf("request %d was unexpectedly rejected", i+1)
		}
	}

	rejected, err := limiter.allow(context.Background(), "key-a", firstWindow)
	if err != nil {
		t.Fatal(err)
	}
	if rejected.allowed {
		t.Fatal("request over the limit was allowed")
	}
	if rejected.retryAfter != 60 {
		t.Fatalf("Retry-After = %d, want 60", rejected.retryAfter)
	}

	otherKey, err := limiter.allow(context.Background(), "key-b", firstWindow)
	if err != nil {
		t.Fatal(err)
	}
	if !otherKey.allowed {
		t.Fatal("a different API key shared the counter")
	}

	nextWindow, err := limiter.allow(context.Background(), "key-a", time.Unix(180, 0))
	if err != nil {
		t.Fatal(err)
	}
	if !nextWindow.allowed {
		t.Fatal("counter was not reset in the next window")
	}
}

func TestRateLimitMiddleware(t *testing.T) {
	tests := []struct {
		name       string
		apiKey     string
		limiter    limiter
		wantStatus int
		wantRetry  string
	}{
		{
			name:       "missing API key",
			limiter:    stubLimiter{result: decision{allowed: true}},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "allowed",
			apiKey:     "key-a",
			limiter:    stubLimiter{result: decision{allowed: true}},
			wantStatus: http.StatusNoContent,
		},
		{
			name:       "limit exceeded",
			apiKey:     "key-a",
			limiter:    stubLimiter{result: decision{allowed: false, retryAfter: 12}},
			wantStatus: http.StatusTooManyRequests,
			wantRetry:  "12",
		},
		{
			name:       "store unavailable",
			apiKey:     "key-a",
			limiter:    stubLimiter{err: errors.New("connection refused")},
			wantStatus: http.StatusServiceUnavailable,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusNoContent)
			})
			handler := rateLimitMiddleware(tt.limiter, "app-1")(next)
			request := httptest.NewRequest(http.MethodGet, "/", nil)
			if tt.apiKey != "" {
				request.Header.Set("X-API-Key", tt.apiKey)
			}
			response := httptest.NewRecorder()

			handler.ServeHTTP(response, request)

			if response.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, tt.wantStatus)
			}
			if got := response.Header().Get("X-Instance-ID"); got != "app-1" {
				t.Fatalf("X-Instance-ID = %q, want app-1", got)
			}
			if got := response.Header().Get("Retry-After"); got != tt.wantRetry {
				t.Fatalf("Retry-After = %q, want %q", got, tt.wantRetry)
			}
		})
	}
}

func TestHealthCheckBypassesRateLimiter(t *testing.T) {
	handler := newHTTPHandler(panicLimiter{}, "app-1")
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if got := response.Header().Get("X-Instance-ID"); got != "app-1" {
		t.Fatalf("X-Instance-ID = %q, want app-1", got)
	}
}

type stubLimiter struct {
	result decision
	err    error
}

func (s stubLimiter) allow(context.Context, string, time.Time) (decision, error) {
	return s.result, s.err
}

type panicLimiter struct{}

func (panicLimiter) allow(context.Context, string, time.Time) (decision, error) {
	panic("health check called the rate limiter")
}
