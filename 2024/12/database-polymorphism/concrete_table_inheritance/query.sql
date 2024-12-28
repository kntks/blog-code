-- Queries for single ticket
-- name: GetBugTicket :one
SELECT * 
FROM bug_tickets
WHERE id = ?
LIMIT 1;

-- name: GetFeatureRequestTicket :one
SELECT *
FROM feature_tickets
WHERE id = ?
LIMIT 1;

-- Queries for listing tickets
-- name: ListBugTickets :many
SELECT * 
FROM bug_tickets 
ORDER BY id;

-- name: ListFeatureRequestTickets :many
SELECT * 
FROM feature_tickets 
ORDER BY id;

-- Mutation queries
-- name: CreateBugTicket :execresult
INSERT INTO bug_tickets (
    title,
    description,
    bug_report
) VALUES (
    ?, 
    ?, 
    ?
);

-- name: CreateFeatureRequestTicket :execresult
INSERT INTO feature_tickets (
    title,
    description,
    feature_request
) VALUES (
    ?, 
    ?, 
    ?
);

-- name: DeleteBugTicket :exec
DELETE FROM bug_tickets
WHERE id = ?;

-- name: DeleteFeatureRequestTicket :exec
DELETE FROM feature_tickets
WHERE id = ?;