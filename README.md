DATABASE STRUCTURE :

1.MAIN DATABASE : dbtest1
+-------------------+
| Tables_in_dbtest1 |
+-------------------+
| admin             |
| books             |
| chekouts          |
| user              |
+-------------------+

2.mysql> desc admin;
| Field    | Type            | Null | Key | Default | Extra          |
+----------+-----------------+------+-----+---------+----------------+
| id       | bigint unsigned | NO   | UNI | NULL    | auto_increment |
| username | varchar(50)     | NO   | PRI | NULL    |                |
| password | varchar(256)    | NO   |     | NULL    |                |
+----------+-----------------+------+-----+---------+----------------+

3.mysql> desc books;
Field         | Type            | Null | Key | Default | Extra          |
+---------------+-----------------+------+-----+---------+----------------+
| id            | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| title         | varchar(100)    | NO   |     | NULL    |                |
| author        | varchar(100)    | NO   |     | NULL    |                |
| genre         | varchar(50)     | YES  |     | NULL    |                |
| publisher     | varchar(50)     | YES  |     | NULL    |                |
| numberofbooks | bigint unsigned | NO   |     | 0       |   

4.mysql> desc chekouts;
+---------------+-----------------+------+-----+---------+----------------+
| Field         | Type            | Null | Key | Default | Extra          |
+---------------+-----------------+------+-----+---------+----------------+
| id            | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| user_id       | varchar(50)     | NO   | MUL | NULL    |                |
| book_id       | bigint unsigned | NO   | MUL | NULL    |                |
| checkout_time | timestamp       | YES  |     | NULL    |                |
| return_time   | timestamp       | YES  |     | NULL    |                |
| admin_id      | bigint unsigned | YES  |     | NULL    |                |
+---------------+-----------------+------+-----+---------+----------------+

5.mysql> desc user;
+-------------+-----------------+------+-----+---------+-------+
| Field       | Type            | Null | Key | Default | Extra |
+-------------+-----------------+------+-----+---------+-------+
| username    | varchar(50)     | NO   | PRI | NULL    |       |
| password    | varchar(256)    | NO   |     | NULL    |       |
| fullname    | varchar(50)     | YES  |     | NULL    |       |
| phonenumber | bigint unsigned | YES  |     | 0       |       |
+-------------+-----------------+------+-----+---------+-------+