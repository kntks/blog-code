package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"
)

type Server struct{}

func (s *Server) registerEndpoints(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/items/{id}", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"message": "Item details",
			"id":      r.PathValue("id"),
		})
	})
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("failed to write JSON response: %v", err)
	}
}

func (s *Server) runServer(server *http.Server, ctx context.Context) {
	go func() {
		log.Println("Starting server...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()
	log.Println("Server started. Press Ctrl+C to exit")

	<-ctx.Done()
	log.Println("Starting shutdown...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Forced shutdown: %v", err)
	}

	log.Println("Server shutdown complete")
}

func (s *Server) start() {
	mux := http.NewServeMux()
	s.registerEndpoints(mux)

	// X-User-ID はサンプル用の簡易的なユーザー識別方法です。
	// 実際のアプリケーションでは、認証ミドルウェアが検証済みの
	// ユーザーIDをコンテキストへ設定し、その値をキーにしてください。
	tokenBucket := NewTokenBucketLimiter(2, 5, 5*time.Minute)
	defer tokenBucket.Close()

	server := &http.Server{
		Addr:    ":8080",
		Handler: tokenBucket.HTTPMiddleware(mux),
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	s.runServer(server, ctx)
}

func main() {
	s := &Server{}
	s.start()
}
