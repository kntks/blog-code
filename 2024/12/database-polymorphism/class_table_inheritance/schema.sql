USE class_table_inheritance;

CREATE TABLE IF NOT EXISTS tickets (
    id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bug_tickets (
    ticket_id   BIGINT NOT NULL PRIMARY KEY,
    bug_report  TEXT NOT NULL,
    FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feature_tickets (
    ticket_id       BIGINT NOT NULL PRIMARY KEY,
    feature_request TEXT NOT NULL,
    FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE
);