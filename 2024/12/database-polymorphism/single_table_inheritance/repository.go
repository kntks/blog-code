package single_table_inheritance

import (
	"context"
	"database-polymorphism/single_table_inheritance/gen"
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
	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%s)/single_table_inheritance", config.User, config.Password, config.Host, config.Port)
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

func (t *ticketRepository) ListBugTickets(ctx context.Context) ([]BugTicket, error) {
	tickets, err := t.queries.ListBugTickets(ctx)
	if err != nil {
		return nil, err
	}

	results := make([]BugTicket, 0, len(tickets))
	for _, ticket := range tickets {
		results = append(results, BugTicket{
			ID:          ticket.ID,
			Type:        TicketType(ticket.Type),
			Title:       ticket.Title,
			Description: ticket.Description,
			BugReport:   ticket.BugReport.String,
		})
	}

	return results, nil
}

func (t *ticketRepository) CreateBugTicket(ctx context.Context, bugTicket BugTicket) error {
	tx, err := t.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := t.queries.WithTx(tx)

	ticketType, err := qtx.FindTicketTypeByName(ctx, bugTicket.Type.String())
	if err != nil {
		return err
	}

	_, err = qtx.CreateTicket(ctx, gen.CreateTicketParams{
		TypeID:      ticketType.ID,
		Title:       bugTicket.Title,
		Description: bugTicket.Description,
		BugReport:   sql.NullString{String: bugTicket.BugReport, Valid: true},
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
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
			Type:           TicketType(ticket.Type),
			Title:          ticket.Title,
			Description:    ticket.Description,
			FeatureRequest: ticket.FeatureRequest.String,
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

	ticketType, err := qtx.FindTicketTypeByName(ctx, featureRequestTicket.Type.String())
	if err != nil {
		return err
	}
	_, err = qtx.CreateTicket(ctx, gen.CreateTicketParams{
		TypeID:         ticketType.ID,
		Title:          featureRequestTicket.Title,
		Description:    featureRequestTicket.Description,
		FeatureRequest: sql.NullString{String: featureRequestTicket.FeatureRequest, Valid: true},
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (t *ticketRepository) DeleteTicket(ctx context.Context, id int64) error {
	if err := t.queries.DeleteTicket(ctx, id); err != nil {
		return err
	}

	return nil
}
