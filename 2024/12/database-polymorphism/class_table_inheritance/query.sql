-- Queries for single ticket
-- name: GetTicket :one
SELECT * 
FROM tickets 
WHERE id = ?
LIMIT 1;

-- name: GetBugTicket :one
SELECT 
    t.id, 
    t.title,
    t.description,
    bt.bug_report
FROM tickets t
    INNER JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
WHERE t.id = ?;

-- name: GetFeatureRequestTicket :one
SELECT 
    t.id, 
    t.title,
    t.description,
    ft.feature_request
FROM tickets t
    INNER JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
WHERE t.id = ?;

-- name: ListTickets :many
SELECT * 
FROM tickets t
    LEFT JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
    LEFT JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
ORDER BY id;

-- name: ListBugTickets :many
SELECT 
    t.id, 
    t.title,
    t.description,
    bt.bug_report
FROM tickets t
    INNER JOIN bug_tickets bt 
        ON t.id = bt.ticket_id
ORDER BY id;

-- name: ListFeatureRequestTickets :many
SELECT 
    t.id, 
    t.title,
    t.description,
    ft.feature_request
FROM tickets t
    INNER JOIN feature_tickets ft 
        ON t.id = ft.ticket_id
ORDER BY id;

-- Mutation queries
-- name: CreateTicket :execresult
INSERT INTO tickets (
    title, 
    description
) VALUES (
    ?, 
    ?
);

-- name: CreateBugTicket :execresult
INSERT INTO bug_tickets (
    ticket_id, 
    bug_report
) VALUES (
    ?, 
    ?
);

-- name: CreateFeatureRequestTicket :execresult
INSERT INTO feature_tickets (
    ticket_id, 
    feature_request
) VALUES (
    ?, 
    ?
);

-- name: DeleteTicket :exec
DELETE FROM tickets 
WHERE id = ?;
