USE example;

-- 映画館テーブル
CREATE TABLE theaters (
  theater_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  total_screens INT NOT NULL
);

-- 映画テーブル
CREATE TABLE movies (
  movie_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  release_date DATE,
  rating VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 上映室テーブル
CREATE TABLE screens (
  screen_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  theater_id INT UNSIGNED NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  FOREIGN KEY (theater_id) REFERENCES theaters(theater_id) ON DELETE CASCADE
);

-- 上映スケジュールテーブル
CREATE TABLE screenings (
  screening_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  movie_id INT UNSIGNED NOT NULL,
  screen_id INT UNSIGNED NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE, 
  FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE
);

-- 座席テーブル
CREATE TABLE seats (
  seat_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  screen_id INT UNSIGNED NOT NULL,
  seat_row VARCHAR(10) NOT NULL,
  seat_number INT NOT NULL,
  seat_type VARCHAR(20) DEFAULT 'standard',
  FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE,
  UNIQUE (screen_id, seat_row, seat_number)
);

-- 顧客テーブル
CREATE TABLE customers (
  customer_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20)
);

-- 予約テーブル
CREATE TABLE reservations (
  reservation_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_id INT UNSIGNED NOT NULL,
  screening_id INT UNSIGNED NOT NULL,
  reserved_at DATETIME NOT NULL,
  cancelled_at DATETIME,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_amount_yen INT NOT NULL,
  payment_method VARCHAR(20),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (screening_id) REFERENCES screenings(screening_id) ON DELETE CASCADE
);

-- 予約座席テーブル (予約と座席の中間テーブル)
CREATE TABLE reservation_seats (
  reservation_id INT UNSIGNED NOT NULL,
  seat_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (reservation_id, seat_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE
);