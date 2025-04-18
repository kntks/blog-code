// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: query.sql

package gen

import (
	"context"
	"database/sql"
)

const createTicket = `-- name: CreateTicket :execresult
INSERT INTO tickets (
    type_id,
    title,
    description,
    bug_report,
    feature_request
) VALUES (
    ?, 
    ?, 
    ?, 
    ?, 
    ?
)
`

type CreateTicketParams struct {
	TypeID         int64
	Title          string
	Description    string
	BugReport      sql.NullString
	FeatureRequest sql.NullString
}

// Mutation queries
func (q *Queries) CreateTicket(ctx context.Context, arg CreateTicketParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createTicket,
		arg.TypeID,
		arg.Title,
		arg.Description,
		arg.BugReport,
		arg.FeatureRequest,
	)
}

const deleteTicket = `-- name: DeleteTicket :exec
DELETE FROM tickets 
WHERE id = ?
`

func (q *Queries) DeleteTicket(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteTicket, id)
	return err
}

const findTicketTypeByName = `-- name: FindTicketTypeByName :one
SELECT 
    id,
    type
FROM ticket_types 
WHERE type = ? 
LIMIT 1
`

func (q *Queries) FindTicketTypeByName(ctx context.Context, type_ string) (TicketType, error) {
	row := q.db.QueryRowContext(ctx, findTicketTypeByName, type_)
	var i TicketType
	err := row.Scan(&i.ID, &i.Type)
	return i, err
}

const getBugTicket = `-- name: GetBugTicket :one
SELECT 
    t.id,
    tt.type,
    t.title,
    t.description,
    t.bug_report
FROM tickets t
    JOIN ticket_types tt 
        ON t.type_id = tt.id
WHERE t.id = ? 
    AND tt.type = 'bug'
LIMIT 1
`

type GetBugTicketRow struct {
	ID          int64
	Type        string
	Title       string
	Description string
	BugReport   sql.NullString
}

// Queries for single ticket
func (q *Queries) GetBugTicket(ctx context.Context, id int64) (GetBugTicketRow, error) {
	row := q.db.QueryRowContext(ctx, getBugTicket, id)
	var i GetBugTicketRow
	err := row.Scan(
		&i.ID,
		&i.Type,
		&i.Title,
		&i.Description,
		&i.BugReport,
	)
	return i, err
}

const getFeatureRequestTicket = `-- name: GetFeatureRequestTicket :one
SELECT 
    t.id, 
    tt.type,
    t.title,
    t.description,
    t.feature_request
FROM tickets t
    JOIN ticket_types tt 
        ON t.type_id = tt.id
WHERE t.id = ? 
    AND tt.type = 'featureRequest'
LIMIT 1
`

type GetFeatureRequestTicketRow struct {
	ID             int64
	Type           string
	Title          string
	Description    string
	FeatureRequest sql.NullString
}

func (q *Queries) GetFeatureRequestTicket(ctx context.Context, id int64) (GetFeatureRequestTicketRow, error) {
	row := q.db.QueryRowContext(ctx, getFeatureRequestTicket, id)
	var i GetFeatureRequestTicketRow
	err := row.Scan(
		&i.ID,
		&i.Type,
		&i.Title,
		&i.Description,
		&i.FeatureRequest,
	)
	return i, err
}

const listBugTickets = `-- name: ListBugTickets :many
SELECT 
    t.id,
    tt.type,
    t.title,
    t.description,
    t.bug_report
FROM tickets t
    JOIN ticket_types tt 
        ON t.type_id = tt.id 
WHERE tt.type = 'bug'
ORDER BY t.id
`

type ListBugTicketsRow struct {
	ID          int64
	Type        string
	Title       string
	Description string
	BugReport   sql.NullString
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
			&i.Type,
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
    tt.type,
    t.title,
    t.description,
    t.feature_request
FROM tickets t
    JOIN ticket_types tt 
        ON t.type_id = tt.id
WHERE tt.type = 'featureRequest'
ORDER BY t.id
`

type ListFeatureRequestTicketsRow struct {
	ID             int64
	Type           string
	Title          string
	Description    string
	FeatureRequest sql.NullString
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
			&i.Type,
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
