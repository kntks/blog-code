package main

import (
	"log"
	"net/http"
	"sync/atomic"
	"time"

	"golang.org/x/time/rate"
)

var (
	limiter   = rate.NewLimiter(rate.Limit(1), 5)
	started   = time.Now()
	requestID atomic.Uint64
)

func HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		now := time.Now()
		id := requestID.Add(1)
		allowed := limiter.AllowN(now, 1) // 調査ログの時刻と、レートリミッターの判定時刻を一致させるために AllowN を使用
		remaining := limiter.TokensAt(now)

		log.Printf(
			"request=%d elapsed=%.3fs method=%s path=%s allowed=%t tokens=%.3f",
			id,
			now.Sub(started).Seconds(),
			r.Method,
			r.URL.Path,
			allowed,
			remaining,
		)

		if !allowed {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"status":"error","message":"レート制限を超えました。しばらくしてからもう一度お試しください。"}`))
			return
		}

		next.ServeHTTP(w, r)
	})
}
