-- Create databases with UTF-8 encoding
CREATE DATABASE IF NOT EXISTS single_table_inheritance 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_0900_ai_ci;

CREATE DATABASE IF NOT EXISTS concrete_table_inheritance 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_0900_ai_ci;

CREATE DATABASE IF NOT EXISTS class_table_inheritance 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_0900_ai_ci;

-- Grant privileges to example user
GRANT SELECT, INSERT, UPDATE, DELETE 
    ON single_table_inheritance.* 
    TO 'example'@'%';

GRANT SELECT, INSERT, UPDATE, DELETE 
    ON concrete_table_inheritance.* 
    TO 'example'@'%';

GRANT SELECT, INSERT, UPDATE, DELETE 
    ON class_table_inheritance.* 
    TO 'example'@'%';

-- Apply privilege changes
FLUSH PRIVILEGES;