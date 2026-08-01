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
		id := r.PathValue("id")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Item details",
			"id":      id,
		})
	})
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

	// トークンバケットレート制限の設定
	handler := HTTPMiddleware(mux)

	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	s.runServer(server, ctx)
}

func main() {
	s := &Server{}
	s.start()
}
