# prisma-upsert-with-delete

## 環境構築
```
$ npm ci
$ docker compose up -d
$ npx prisma migrate dev
$ npx ts-node src/main.ts
```


```bash
$ docker compose exec db mysql -uroot 
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> use example;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+--------------------+
| Tables_in_example  |
+--------------------+
| _PostsToTags       |
| _prisma_migrations |
| posts              |
| tags               |
+--------------------+
4 rows in set (0.02 sec)

mysql> desc _PostsToTags;
+-------+------+------+-----+---------+-------+
| Field | Type | Null | Key | Default | Extra |
+-------+------+------+-----+---------+-------+
| A     | int  | NO   | PRI | NULL    |       |
| B     | int  | NO   | PRI | NULL    |       |
+-------+------+------+-----+---------+-------+
2 rows in set (0.05 sec)

mysql> select * from _PostsToTags;
+---+---+
| A | B |
+---+---+
| 1 | 1 |
| 2 | 1 |
+---+---+
2 rows in set (0.09 sec)
```