console.log("sql.js start")

require('dotenv').config();
var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port, // db 포트
  user: process.env.user, // user 이름
  password: process.env.password, // 비밀번호
  database: process.env.database, // database 이름
});

for (var i = 1; i < 101; i++){
    var id = "test"+i;
    connection.query(
        `insert into user (id, password, name, phone, email, linkcode) value (?,?,?,?,?,?)`,
        [id, '1234', '서현규', '01021884701', 'omnipede@naver.com', "1"],
        function(err, result){
            if(err){
                console.log(err)
            }else{
                console.log(result);
            }
        }
    )
}