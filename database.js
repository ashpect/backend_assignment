const mysql=require('mysql');
module.exports=mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Ashish_mysql22",
    database: "dbtest1",
    port:3306,
  });