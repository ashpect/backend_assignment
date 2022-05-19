const mysql=require('mysql');
module.exports=mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "",
    port:3306,
  });