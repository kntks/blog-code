USE single_table_inheritance;

CREATE TABLE IF NOT EXISTS ticket_types (
    id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tickets (
    id              BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type_id         BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    bug_report      TEXT,
    feature_request TEXT
);

-- Insert Master Data
INSERT INTO ticket_types (id, type) 
VALUES 
    (1, 'bug'),
    (2, 'featureRequest');