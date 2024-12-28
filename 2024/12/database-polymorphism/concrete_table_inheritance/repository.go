package concrete_table_inheritance

import (
	"context"
	"database-polymorphism/concrete_table_inheritance/gen"
	"fmt"
	"log"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

type ticketRepository struct {
	db      *sql.DB
	queries *gen.Queries
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
}

func NewTicketRepository(config DBConfig) *ticketRepository {
	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%s)/concrete_table_inheritance", config.User, config.Password, config.Host, config.Port)
	db, err := sql.Open("mysql", dataSourceName)
	if err != nil {
		log.Fatalln(err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalln(err)
	}

	queries := gen.New(db)

	return &ticketRepository{db: db, queries: queries}
}

func (t *ticketRepository) CreateBugTicket(ctx context.Context, bugTicket BugTicket) error {
	tx, err := t.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := t.queries.WithTx(tx)

	_, err = qtx.CreateBugTicket(ctx, gen.CreateBugTicketParams{
		Title:       bugTicket.Title,
		Description: bugTicket.Description,
		BugReport:   bugTicket.BugReport,
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (t *ticketRepository) GetBugTicket(ctx context.Context, id int64) (*BugTicket, error) {
	ticket, err := t.queries.GetBugTicket(ctx, id)
	if err != nil {
		return nil, err
	}

	return &BugTicket{
		ID:          ticket.ID,
		Title:       ticket.Title,
		Description: ticket.Description,
		BugReport:   ticket.BugReport,
	}, nil
}

func (t *ticketRepository) ListBugTickets(ctx context.Context) ([]BugTicket, error) {
	tickets, err := t.queries.ListBugTickets(ctx)
	if err != nil {
		return nil, err
	}

	results := make([]BugTicket, 0, len(tickets))
	for _, ticket := range tickets {
		results = append(results, BugTicket{
			ID:          ticket.ID,
			Title:       ticket.Title,
			Description: ticket.Description,
			BugReport:   ticket.BugReport,
		})
	}

	return results, nil
}

func (t *ticketRepository) CreateFeatureRequestTicket(ctx context.Context, featureRequestTicket FeatureRequestTicket) error {
	tx, err := t.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := t.queries.WithTx(tx)

	_, err = qtx.CreateFeatureRequestTicket(ctx, gen.CreateFeatureRequestTicketParams{
		Title:          featureRequestTicket.Title,
		Description:    featureRequestTicket.Description,
		FeatureRequest: featureRequestTicket.FeatureRequest,
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (t *ticketRepository) GetFeatureRequestTicket(ctx context.Context, id int64) (*FeatureRequestTicket, error) {
	ticket, err := t.queries.GetFeatureRequestTicket(ctx, id)
	if err != nil {
		return nil, err
	}

	return &FeatureRequestTicket{
		ID:             ticket.ID,
		Title:          ticket.Title,
		Description:    ticket.Description,
		FeatureRequest: ticket.FeatureRequest,
	}, nil
}

func (t *ticketRepository) ListFeatureRequestTickets(ctx context.Context) ([]FeatureRequestTicket, error) {
	tickets, err := t.queries.ListFeatureRequestTickets(ctx)
	if err != nil {
		return nil, err
	}

	results := make([]FeatureRequestTicket, 0, len(tickets))
	for _, ticket := range tickets {
		results = append(results, FeatureRequestTicket{
			ID:             ticket.ID,
			Title:          ticket.Title,
			Description:    ticket.Description,
			FeatureRequest: ticket.FeatureRequest,
		})
	}

	return results, nil
}

func (t *ticketRepository) DeleteBugTicket(ctx context.Context, id int64) error {
	if err := t.queries.DeleteBugTicket(ctx, id); err != nil {
		return err
	}

	return nil
}

func (t *ticketRepository) DeleteFeatureReuqestTicket(ctx context.Context, id int64) error {
	if err := t.queries.DeleteFeatureRequestTicket(ctx, id); err != nil {
		return err
	}

	return nil
}
