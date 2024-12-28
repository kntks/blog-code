// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: query.sql

package gen

import (
	"context"
	"database/sql"
)

const createBugTicket = `-- name: CreateBugTicket :execresult
INSERT INTO bug_tickets (
    ticket_id, 
    bug_report
) VALUES (
    ?, 
    ?
)
`

type CreateBugTicketParams struct {
	TicketID  int64
	BugReport string
}

func (q *Queries) CreateBugTicket(ctx context.Context, arg CreateBugTicketParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createBugTicket, arg.TicketID, arg.BugReport)
}

const createFeatureRequestTicket = `-- name: CreateFeatureRequestTicket :execresult
INSERT INTO feature_tickets (
    ticket_id, 
    feature_request
) VALUES (
    ?, 
    ?
)
`

type CreateFeatureRequestTicketParams struct {
	TicketID       int64
	FeatureRequest string
}

func (q *Queries) CreateFeatureRequestTicket(ctx context.Context, arg CreateFeatureRequestTicketParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createFeatureRequestTicket, arg.TicketID, arg.FeatureRequest)
}

const createTicket = `-- name: CreateTicket :execresult
INSERT INTO tickets (
    title, 
    description
) VALUES (
    ?, 
    ?
)
`

type CreateTicketParams struct {
	Title       string
	Description string
}

// Mutation queries
func (q *Queries) CreateTicket(ctx context.Context, arg CreateTicketParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createTicket, arg.Title, arg.Description)
}

const deleteTicket = `-- name: DeleteTicket :exec
DELETE FROM tickets 
WHERE id = ?
`

func (q *Queries) DeleteTicket(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteTicket, id)
	return err
}

const getBugTicket = `-- name: GetBugTicket :one
SELECT 
    t.id, 
    t.title,
    t.description,
    bt.bug_report
FROM tickets t
    INNER JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
WHERE t.id = ?
`

type GetBugTicketRow struct {
	ID          int64
	Title       string
	Description string
	BugReport   string
}

func (q *Queries) GetBugTicket(ctx context.Context, id int64) (GetBugTicketRow, error) {
	row := q.db.QueryRowContext(ctx, getBugTicket, id)
	var i GetBugTicketRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.BugReport,
	)
	return i, err
}

const getFeatureRequestTicket = `-- name: GetFeatureRequestTicket :one
SELECT 
    t.id, 
    t.title,
    t.description,
    ft.feature_request
FROM tickets t
    INNER JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
WHERE t.id = ?
`

type GetFeatureRequestTicketRow struct {
	ID             int64
	Title          string
	Description    string
	FeatureRequest string
}

func (q *Queries) GetFeatureRequestTicket(ctx context.Context, id int64) (GetFeatureRequestTicketRow, error) {
	row := q.db.QueryRowContext(ctx, getFeatureRequestTicket, id)
	var i GetFeatureRequestTicketRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.FeatureRequest,
	)
	return i, err
}

const getTicket = `-- name: GetTicket :one
SELECT id, title, description 
FROM tickets 
WHERE id = ?
LIMIT 1
`

// Queries for single ticket
func (q *Queries) GetTicket(ctx context.Context, id int64) (Ticket, error) {
	row := q.db.QueryRowContext(ctx, getTicket, id)
	var i Ticket
	err := row.Scan(&i.ID, &i.Title, &i.Description)
	return i, err
}

const listBugTickets = `-- name: ListBugTickets :many
SELECT 
    t.id, 
    t.title,
    t.description,
    bt.bug_report
FROM tickets t
    INNER JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
ORDER BY id
`

type ListBugTicketsRow struct {
	ID          int64
	Title       string
	Description string
	BugReport   string
}

func (q *Queries) ListBugTickets(ctx context.Context) ([]ListBugTicketsRow, error) {
	rows, err := q.db.QueryContext(ctx, listBugTickets)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListBugTicketsRow
	for rows.Next() {
		var i ListBugTicketsRow
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.BugReport,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listFeatureRequestTickets = `-- name: ListFeatureRequestTickets :many
SELECT 
    t.id, 
    t.title,
    t.description,
    ft.feature_request
FROM tickets t
    INNER JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
ORDER BY id
`

type ListFeatureRequestTicketsRow struct {
	ID             int64
	Title          string
	Description    string
	FeatureRequest string
}

func (q *Queries) ListFeatureRequestTickets(ctx context.Context) ([]ListFeatureRequestTicketsRow, error) {
	rows, err := q.db.QueryContext(ctx, listFeatureRequestTickets)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListFeatureRequestTicketsRow
	for rows.Next() {
		var i ListFeatureRequestTicketsRow
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.FeatureRequest,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listTickets = `-- name: ListTickets :many
SELECT id, title, description, bt.ticket_id, bug_report, ft.ticket_id, feature_request 
FROM tickets t
    LEFT JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
    LEFT JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
ORDER BY id
`

type ListTicketsRow struct {
	ID             int64
	Title          string
	Description    string
	TicketID       sql.NullInt64
	BugReport      sql.NullString
	TicketID_2     sql.NullInt64
	FeatureRequest sql.NullString
}

func (q *Queries) ListTickets(ctx context.Context) ([]ListTicketsRow, error) {
	rows, err := q.db.QueryContext(ctx, listTickets)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListTicketsRow
	for rows.Next() {
		var i ListTicketsRow
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.TicketID,
			&i.BugReport,
			&i.TicketID_2,
			&i.FeatureRequest,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
