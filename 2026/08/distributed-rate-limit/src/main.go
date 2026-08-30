package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
)

const incrementScript = `
local count = redis.call("INCR", KEYS[1])

if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end

return count
`

type config struct {
	listenAddr string
	instanceID string
	mode       string
	limit      int64
	window     time.Duration
	valkeyAddr string
}

type decision struct {
	allowed    bool
	retryAfter int64
}

type limiter interface {
	allow(ctx context.Context, apiKey string, now time.Time) (decision, error)
}

type localEntry struct {
	windowID int64
	count    int64
}

type localLimiter struct {
	mu      sync.Mutex
	entries map[string]localEntry
	limit   int64
	window  time.Duration
}

func newLocalLimiter(limit int64, window time.Duration) *localLimiter {
	return &localLimiter{
		entries: make(map[string]localEntry),
		limit:   limit,
		window:  window,
	}
}

func (l *localLimiter) allow(_ context.Context, apiKey string, now time.Time) (decision, error) {
	windowID, retryAfter := windowInfo(now, l.window)
	key := hashAPIKey(apiKey)

	l.mu.Lock()
	defer l.mu.Unlock()

	entry := l.entries[key]
	if entry.windowID != windowID {
		entry = localEntry{windowID: windowID}
	}
	entry.count++
	l.entries[key] = entry

	return decision{
		allowed:    entry.count <= l.limit,
		retryAfter: retryAfter,
	}, nil
}

type sharedLimiter struct {
	client *redis.Client
	script *redis.Script
	limit  int64
	window time.Duration
}

func newSharedLimiter(client *redis.Client, limit int64, window time.Duration) *sharedLimiter {
	return &sharedLimiter{
		client: client,
		script: redis.NewScript(incrementScript),
		limit:  limit,
		window: window,
	}
}

func (l *sharedLimiter) allow(ctx context.Context, apiKey string, now time.Time) (decision, error) {
	windowID, retryAfter := windowInfo(now, l.window)
	key := fmt.Sprintf("rate:apikey:{%s}:%d", hashAPIKey(apiKey), windowID)

	count, err := l.script.Run(ctx, l.client, []string{key}, retryAfter).Int64()
	if err != nil {
		return decision{}, fmt.Errorf("increment shared counter: %w", err)
	}

	return decision{
		allowed:    count <= l.limit,
		retryAfter: retryAfter,
	}, nil
}

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	var rateLimiter limiter
	var valkeyClient *redis.Client

	switch cfg.mode {
	case "local":
		rateLimiter = newLocalLimiter(cfg.limit, cfg.window)
	case "shared":
		valkeyClient = redis.NewClient(&redis.Options{Addr: cfg.valkeyAddr})
		defer valkeyClient.Close()
		rateLimiter = newSharedLimiter(valkeyClient, cfg.limit, cfg.window)
	default:
		log.Fatalf("RATE_LIMIT_MODE must be local or shared, got %q", cfg.mode)
	}

	server := &http.Server{
		Addr:              cfg.listenAddr,
		Handler:           newHTTPHandler(rateLimiter, cfg.instanceID),
		ReadHeaderTimeout: 5 * time.Second,
	}

	shutdownCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-shutdownCtx.Done()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("HTTP server shutdown: %v", err)
		}
	}()

	log.Printf(
		"startup config: LISTEN_ADDR=%s INSTANCE_ID=%s RATE_LIMIT_MODE=%s RATE_LIMIT_MAX=%d RATE_LIMIT_WINDOW=%s VALKEY_ADDR=%s",
		cfg.listenAddr,
		cfg.instanceID,
		cfg.mode,
		cfg.limit,
		cfg.window,
		cfg.valkeyAddr,
	)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func newHTTPHandler(rateLimiter limiter, instanceID string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("X-Instance-ID", instanceID)
		w.WriteHeader(http.StatusNoContent)
	})
	mux.Handle("/", rateLimitMiddleware(rateLimiter, instanceID)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = fmt.Fprintf(w, "handled by %s\n", instanceID)
	})))
	return accessLogMiddleware(mux, instanceID)
}

func accessLogMiddleware(next http.Handler, instanceID string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// /healthz is polled by the container healthcheck and would otherwise
		// obscure the application requests in the logs.
		if r.URL.Path == "/healthz" {
			next.ServeHTTP(w, r)
			return
		}

		started := time.Now()
		writer := &statusRecorder{ResponseWriter: w}
		next.ServeHTTP(writer, r)

		status := writer.status
		if status == 0 {
			status = http.StatusOK
		}
		log.Printf(
			"access method=%s path=%s status=%d instance=%s duration=%s",
			r.Method,
			r.URL.Path,
			status,
			instanceID,
			time.Since(started),
		)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (w *statusRecorder) WriteHeader(status int) {
	if w.status != 0 {
		return
	}
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *statusRecorder) Write(body []byte) (int, error) {
	if w.status == 0 {
		w.WriteHeader(http.StatusOK)
	}
	return w.ResponseWriter.Write(body)
}

func rateLimitMiddleware(rateLimiter limiter, instanceID string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Instance-ID", instanceID)

			apiKey := r.Header.Get("X-API-Key")
			if apiKey == "" {
				http.Error(w, "X-API-Key is required", http.StatusUnauthorized)
				return
			}

			result, err := rateLimiter.allow(r.Context(), apiKey, time.Now())
			if err != nil {
				log.Printf("rate limit store error: %v", err)
				http.Error(w, "rate limit store unavailable", http.StatusServiceUnavailable)
				return
			}
			if !result.allowed {
				w.Header().Set("Retry-After", strconv.FormatInt(result.retryAfter, 10))
				http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func loadConfig() (config, error) {
	limit, err := positiveInt64Env("RATE_LIMIT_MAX", 100)
	if err != nil {
		return config{}, err
	}

	windowText := envOrDefault("RATE_LIMIT_WINDOW", "60s")
	window, err := time.ParseDuration(windowText)
	if err != nil || window < time.Second || window%time.Second != 0 {
		return config{}, fmt.Errorf("RATE_LIMIT_WINDOW must be a whole number of seconds, got %q", windowText)
	}

	instanceID := os.Getenv("INSTANCE_ID")
	if instanceID == "" {
		instanceID, err = os.Hostname()
		if err != nil {
			return config{}, fmt.Errorf("determine instance ID: %w", err)
		}
	}

	return config{
		listenAddr: envOrDefault("LISTEN_ADDR", ":8080"),
		instanceID: instanceID,
		mode:       strings.ToLower(envOrDefault("RATE_LIMIT_MODE", "local")),
		limit:      limit,
		window:     window,
		valkeyAddr: envOrDefault("VALKEY_ADDR", "localhost:6379"),
	}, nil
}

func positiveInt64Env(name string, fallback int64) (int64, error) {
	text := os.Getenv(name)
	if text == "" {
		return fallback, nil
	}
	value, err := strconv.ParseInt(text, 10, 64)
	if err != nil || value <= 0 {
		return 0, fmt.Errorf("%s must be a positive integer, got %q", name, text)
	}
	return value, nil
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func windowInfo(now time.Time, window time.Duration) (windowID, retryAfter int64) {
	windowSeconds := int64(window / time.Second)
	nowSeconds := now.Unix()
	return nowSeconds / windowSeconds, windowSeconds - nowSeconds%windowSeconds
}

func hashAPIKey(apiKey string) string {
	sum := sha256.Sum256([]byte(apiKey))
	return hex.EncodeToString(sum[:])
}
