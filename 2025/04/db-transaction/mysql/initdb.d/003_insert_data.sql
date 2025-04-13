use example;

-- サンプル映画館
INSERT INTO theaters (name, address, phone, total_screens) VALUES
('シネマパラダイス', '東京都新宿区新宿3-1-1', '03-1234-5678', 8),
('スターシアター', '大阪府大阪市北区梅田1-1-3', '06-8765-4321', 6),
('サンライズ映画館', '福岡県福岡市博多区博多駅前2-2-1', '092-555-7777', 4);

SET @cinema_paradise_id = 1;  -- シネマパラダイス
SET @star_theater_id = 2;     -- スターシアター
SET @sunrise_cinema_id = 3;   -- サンライズ映画館

-- サンプル上映室
INSERT INTO screens (theater_id, name, capacity) VALUES
(@cinema_paradise_id, 'スクリーン1', 150),
(@cinema_paradise_id, 'スクリーン2', 120),
(@cinema_paradise_id, 'スクリーン3', 100),
(@star_theater_id, 'HALL A', 200),
(@star_theater_id, 'HALL B', 150),
(@sunrise_cinema_id, 'シアター1', 180),
(@sunrise_cinema_id, 'シアター2', 140);

SET @screen1_id = 1;  -- シネマパラダイス スクリーン1
SET @screen2_id = 2;  -- シネマパラダイス スクリーン2
SET @screen3_id = 3;  -- シネマパラダイス スクリーン3
SET @hall_a_id = 4;   -- スターシアター HALL A
SET @hall_b_id = 5;   -- スターシアター HALL B
SET @theater1_id = 6; -- サンライズ映画館 シアター1
SET @theater2_id = 7; -- サンライズ映画館 シアター2

-- サンプル映画
INSERT INTO movies (title, description, duration_minutes, release_date, rating) VALUES
('宇宙の彼方へ', '宇宙探査をテーマにしたSF大作', 142, '2024-01-15', 'PG-12'),
('永遠の愛', '時代を超えた恋愛ドラマ', 118, '2024-02-20', 'G'),
('都市の影', 'サスペンスに満ちた犯罪ドラマ', 135, '2024-03-05', 'R-15'),
('笑顔の向こう側', '家族の絆を描いた感動作', 127, '2024-01-30', 'G'),
('最後の戦士', 'アクション満載の歴史大河劇', 160, '2024-02-10', 'PG-12');

SET @space_movie_id = 1;      -- 宇宙の彼方へ
SET @love_movie_id = 2;       -- 永遠の愛
SET @crime_movie_id = 3;      -- 都市の影
SET @family_movie_id = 4;     -- 笑顔の向こう側
SET @action_movie_id = 5;     -- 最後の戦士

SET @today = CURDATE();
SET @tomorrow = DATE_ADD(@today, INTERVAL 1 DAY);
SET @day_after_tomorrow = DATE_ADD(@today, INTERVAL 2 DAY);

-- サンプル上映スケジュール（1週間分）
INSERT INTO screenings (movie_id, screen_id, start_time, end_time) VALUES
-- 本日の上映
(@space_movie_id, @screen1_id, CONCAT(@today, ' 10:00:00'), CONCAT(@today, ' 12:22:00')),
(@love_movie_id, @screen1_id, CONCAT(@today, ' 13:30:00'), CONCAT(@today, ' 15:28:00')),
(@crime_movie_id, @screen1_id, CONCAT(@today, ' 16:30:00'), CONCAT(@today, ' 18:45:00')),
(@space_movie_id, @screen2_id, CONCAT(@today, ' 11:30:00'), CONCAT(@today, ' 13:52:00')),
(@family_movie_id, @screen2_id, CONCAT(@today, ' 15:00:00'), CONCAT(@today, ' 17:07:00')),
(@action_movie_id, @screen3_id, CONCAT(@today, ' 10:30:00'), CONCAT(@today, ' 13:10:00')),
(@love_movie_id, @screen3_id, CONCAT(@today, ' 14:30:00'), CONCAT(@today, ' 16:28:00')),
-- 明日の上映
(@space_movie_id, @hall_a_id, CONCAT(@tomorrow, ' 10:00:00'), CONCAT(@tomorrow, ' 12:22:00')),
(@crime_movie_id, @hall_a_id, CONCAT(@tomorrow, ' 14:00:00'), CONCAT(@tomorrow, ' 16:15:00')),
(@family_movie_id, @hall_b_id, CONCAT(@tomorrow, ' 11:00:00'), CONCAT(@tomorrow, ' 13:07:00')),
(@action_movie_id, @hall_b_id, CONCAT(@tomorrow, ' 14:30:00'), CONCAT(@tomorrow, ' 17:10:00')),
(@love_movie_id, @theater1_id, CONCAT(@tomorrow, ' 10:30:00'), CONCAT(@tomorrow, ' 12:28:00')),
(@crime_movie_id, @theater1_id, CONCAT(@tomorrow, ' 13:30:00'), CONCAT(@tomorrow, ' 15:45:00')),
(@family_movie_id, @theater2_id, CONCAT(@tomorrow, ' 11:30:00'), CONCAT(@tomorrow, ' 13:37:00')),
(@action_movie_id, @theater2_id, CONCAT(@tomorrow, ' 15:00:00'), CONCAT(@tomorrow, ' 17:40:00'));

-- スクリーニングIDを変数に格納
SET @screening1_id = 1;
SET @screening2_id = 2;
SET @screening3_id = 3;
SET @screening4_id = 4;
SET @screening5_id = 5;
SET @screening6_id = 6;
SET @screening7_id = 7;
SET @screening8_id = 8;
SET @screening9_id = 9;
SET @screening10_id = 10;
SET @screening11_id = 11;
SET @screening12_id = 12;

-- サンプル座席（各スクリーンの最初の数行のみ）
-- スクリーン1の座席
INSERT INTO seats (screen_id, seat_row, seat_number, seat_type) VALUES
(@screen1_id, 'A', 1, 'standard'), (@screen1_id, 'A', 2, 'standard'), 
(@screen1_id, 'A', 3, 'standard'), (@screen1_id, 'A', 4, 'standard'), 
(@screen1_id, 'A', 5, 'standard'),
(@screen1_id, 'B', 1, 'standard'), (@screen1_id, 'B', 2, 'standard'), 
(@screen1_id, 'B', 3, 'standard'), (@screen1_id, 'B', 4, 'standard'), 
(@screen1_id, 'B', 5, 'standard'),
(@screen1_id, 'C', 1, 'premium'), (@screen1_id, 'C', 2, 'premium'), 
(@screen1_id, 'C', 3, 'premium'), (@screen1_id, 'C', 4, 'premium'), 
(@screen1_id, 'C', 5, 'premium');

-- スクリーン2の座席
INSERT INTO seats (screen_id, seat_row, seat_number, seat_type) VALUES
(@screen2_id, 'A', 1, 'standard'), (@screen2_id, 'A', 2, 'standard'), 
(@screen2_id, 'A', 3, 'standard'), (@screen2_id, 'A', 4, 'standard'),
(@screen2_id, 'B', 1, 'standard'), (@screen2_id, 'B', 2, 'standard'), 
(@screen2_id, 'B', 3, 'standard'), (@screen2_id, 'B', 4, 'standard'),
(@screen2_id, 'C', 1, 'premium'), (@screen2_id, 'C', 2, 'premium'), 
(@screen2_id, 'C', 3, 'premium'), (@screen2_id, 'C', 4, 'premium');


-- 座席IDを変数に格納
SET @seat1_1 = 1;  -- スクリーン1の座席A1
SET @seat1_2 = 2;  -- スクリーン1の座席A2
SET @seat1_3 = 3;  -- スクリーン1の座席A3
SET @seat1_11 = 11; -- スクリーン1の座席C1
SET @seat1_12 = 12; -- スクリーン1の座席C2
SET @seat1_13 = 13; -- スクリーン1の座席C3
SET @seat2_1 = 16;  -- スクリーン2の座席A1
SET @seat2_2 = 17;  -- スクリーン2の座席A2
SET @seat2_5 = 20;  -- スクリーン2の座席B1
SET @seat2_9 = 24;  -- スクリーン2の座席C1
SET @seat2_10 = 25; -- スクリーン2の座席C2

-- サンプル顧客
INSERT INTO customers (name, first_name, last_name, email, phone) VALUES
('山田太郎', '太郎', '山田', 'taro.yamada@example.com', '090-1111-2222'),
('佐藤花子', '花子', '佐藤', 'hanako.sato@example.com', '090-2222-3333'),
('鈴木一郎', '一郎', '鈴木', 'ichiro.suzuki@example.com', '090-3333-4444'),
('田中美咲', '美咲', '田中', 'misaki.tanaka@example.com', '090-4444-5555'),
('高橋健太', '健太', '高橋', 'kenta.takahashi@example.com', '090-5555-6666');

-- 顧客IDを変数に格納
SET @yamada_id = 1;
SET @sato_id = 2;
SET @suzuki_id = 3;
SET @tanaka_id = 4;
SET @takahashi_id = 5;

-- 予約日時を変数に設定
SET @five_days_ago = DATE_SUB(@today, INTERVAL 5 DAY);
SET @four_days_ago = DATE_SUB(@today, INTERVAL 4 DAY);
SET @three_days_ago = DATE_SUB(@today, INTERVAL 3 DAY);
SET @two_days_ago = DATE_SUB(@today, INTERVAL 2 DAY);

-- サンプル予約
INSERT INTO reservations (customer_id, screening_id, reserved_at, status, total_amount_yen, payment_method) VALUES
(@yamada_id, @screening1_id, CONCAT(@five_days_ago, ' 14:30:00'), 'confirmed', 3000, 'credit_card'),
(@sato_id, @screening3_id, CONCAT(@four_days_ago, ' 10:15:00'), 'confirmed', 2800, 'credit_card'),
(@suzuki_id, @screening5_id, CONCAT(@four_days_ago, ' 18:45:00'), 'confirmed', 3200, 'bank_transfer'),
(@tanaka_id, @screening8_id, CONCAT(@three_days_ago, ' 09:20:00'), 'confirmed', 3000, 'credit_card'),
(@takahashi_id, @screening10_id, CONCAT(@two_days_ago, ' 12:10:00'), 'pending', 2800, NULL),
(@yamada_id, @screening12_id, CONCAT(@two_days_ago, ' 16:30:00'), 'cancelled', 3000, 'credit_card');

-- 予約IDを変数に格納
SET @reservation1_id = 1;
SET @reservation2_id = 2;
SET @reservation3_id = 3;
SET @reservation4_id = 4;
SET @reservation5_id = 5;
SET @reservation6_id = 6;

-- サンプル予約座席
INSERT INTO reservation_seats (reservation_id, seat_id) VALUES
(@reservation1_id, @seat1_1), (@reservation1_id, @seat1_2),  -- 山田太郎の予約（スクリーン1のA1, A2）
(@reservation2_id, @seat1_11), (@reservation2_id, @seat1_12), (@reservation2_id, @seat1_13),  -- 佐藤花子の予約（スクリーン1のC1, C2, C3）
(@reservation3_id, @seat2_1), (@reservation3_id, @seat2_2),  -- 鈴木一郎の予約（スクリーン2のA1, A2）
(@reservation4_id, @seat1_1), (@reservation4_id, @seat1_2), (@reservation4_id, @seat1_3),  -- 田中美咲の予約（スクリーン1のA1, A2, A3）
(@reservation5_id, @seat2_5), -- 高橋健太の予約（スクリーン2のB1）
(@reservation6_id, @seat2_9), (@reservation6_id, @seat2_10);  -- 山田太郎の予約（スクリーン2のC1, C2）