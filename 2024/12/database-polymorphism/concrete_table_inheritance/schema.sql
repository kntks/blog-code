USE concrete_table_inheritance;

CREATE TABLE bug_tickets (
    id              BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    bug_report      TEXT NOT NULL
);

CREATE TABLE feature_tickets (
    id              BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    feature_request TEXT NOT NULL
);