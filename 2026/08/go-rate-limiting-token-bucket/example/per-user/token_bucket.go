package main

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type userLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// TokenBucketLimiter はユーザーごとに独立したレート制限を管理します。
type TokenBucketLimiter struct {
	clients         map[string]*userLimiter
	mu              sync.Mutex
	rps             float64
	burst           int
	cleanupInterval time.Duration
	stop            chan struct{}
	done            chan struct{}
	closeOnce       sync.Once
}

// NewTokenBucketLimiter はユーザー単位の TokenBucketLimiter を生成します。
// rps は1秒あたりのトークン補充数、burst はバケットの最大容量です。
func NewTokenBucketLimiter(rps float64, burst int, cleanupInterval time.Duration) *TokenBucketLimiter {
	limiter := &TokenBucketLimiter{
		clients:         make(map[string]*userLimiter),
		rps:             rps,
		burst:           burst,
		cleanupInterval: cleanupInterval,
		stop:            make(chan struct{}),
		done:            make(chan struct{}),
	}

	go limiter.cleanupStaleUsers()
	return limiter
}

// Close は cleanup goroutine を停止します。
func (t *TokenBucketLimiter) Close() {
	t.closeOnce.Do(func() {
		close(t.stop)
		<-t.done
	})
}

func (t *TokenBucketLimiter) getUserLimiter(userID string, now time.Time) *rate.Limiter {
	t.mu.Lock()
	defer t.mu.Unlock()

	client, exists := t.clients[userID]
	if !exists {
		client = &userLimiter{
			limiter: rate.NewLimiter(rate.Limit(t.rps), t.burst),
		}
		t.clients[userID] = client
	}
	client.lastSeen = now

	return client.limiter
}

func (t *TokenBucketLimiter) cleanupStaleUsers() {
	defer close(t.done)

	ticker := time.NewTicker(t.cleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case now := <-ticker.C:
			t.mu.Lock()
			for userID, client := range t.clients {
				if now.Sub(client.lastSeen) > time.Hour {
					delete(t.clients, userID)
				}
			}
			t.mu.Unlock()
		case <-t.stop:
			return
		}
	}
}

// HTTPMiddleware は X-User-ID ごとにレート制限を適用する HTTP ミドルウェアです。
func (t *TokenBucketLimiter) HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := strings.TrimSpace(r.Header.Get("X-User-ID"))
		if userID == "" {
			writeJSON(w, http.StatusUnauthorized, map[string]string{
				"status":  "error",
				"message": "X-User-ID header is required",
			})
			return
		}

		now := time.Now()
		limiter := t.getUserLimiter(userID, now)
		allowed := limiter.AllowN(now, 1)

		log.Printf("user=%s method=%s path=%s allowed=%t tokens=%.3f", userID, r.Method, r.URL.Path, allowed, limiter.TokensAt(now))
		if !allowed {
			writeJSON(w, http.StatusTooManyRequests, map[string]string{
				"status":  "error",
				"message": "レート制限を超えました。しばらくしてからもう一度お試しください。",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
