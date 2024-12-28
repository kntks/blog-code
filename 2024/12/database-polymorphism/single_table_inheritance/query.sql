-- Queries for single ticket
-- name: GetBugTicket :one
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
LIMIT 1;

-- name: GetFeatureRequestTicket :one
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
LIMIT 1;

-- name: FindTicketTypeByName :one
SELECT 
    id,
    type
FROM ticket_types 
WHERE type = ? 
LIMIT 1;

-- name: ListBugTickets :many
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
ORDER BY t.id;

-- name: ListFeatureRequestTickets :many
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
ORDER BY t.id;

-- Mutation queries
-- name: CreateTicket :execresult
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
);

-- name: DeleteTicket :exec
DELETE FROM tickets 
WHERE id = ?;