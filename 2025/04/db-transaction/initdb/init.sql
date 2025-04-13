
DROP DATABASE IF EXISTS example;
CREATE DATABASE example;

USE example;

-- usersテーブルの定義
DROP TABLE IF EXISTS users, posts;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- postsテーブルの定義
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `users` (name) VALUES
('userA'),
('userB'),
('userC'),
('userD'),
('userE'),
('userF');

INSERT INTO `posts` (name, created_by, created_at) VALUES
('post1', 1, now()),
('post2', 2, now()),
('post3', 3, now()),
('post4', 4, now()),
('post5', 5, now()),
('post6', 6, now()),
('post7', 1, now()),
('post8', 1, now()),
('post9', 1, now()),
('post10', 2, now()),
('post11', 2, now()),
('post12', 3, now()),
('post13', 4, now()),
('post14', 5, now());
