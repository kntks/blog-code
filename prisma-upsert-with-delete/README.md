# prisma-upsert-with-delete

[【Prisma】 データをupdateしたとき、関連するテーブルも同時にupdateまたはupsertする](https://blog.takenoko.dev/posts/2023/03/prisma-upsert-with-delete/)で使用したコードです。

## 環境構築
```
$ npm ci
$ docker compose up -d
$ npx prisma migrate dev
$ npx ts-node src/main.ts
```

```bash
$ docker compose exec db mysql -uroot -proot
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> use example;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+--------------------+
| Tables_in_example  |
+--------------------+
| PostTags           |
| _prisma_migrations |
| posts              |
| tags               |
+--------------------+
4 rows in set (0.02 sec)

mysql> select * from posts;
+----+---------------+---------+
| id | url           | title   |
+----+---------------+---------+
|  1 | https://xxxxx | example |
+----+---------------+---------+
1 row in set (0.00 sec)

mysql> select * from PostTags;
+-------+--------+
| tagId | postId |
+-------+--------+
|     1 |      1 |
|     2 |      1 |
+-------+--------+
2 rows in set (0.00 sec)
```