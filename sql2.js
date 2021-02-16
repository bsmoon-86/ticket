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


    // var id = "test";
    // connection.query(
    //     `insert into matrix2 (id, real_, predict) value (?,?,?)`,
    //     [id, '1234', '서현규'],
    //     function(err, result){
    //         if(err){
    //             console.log(err)
    //         }else{
    //             console.log(result);
    //         }
    //     }
    // )

for (var i = 1; i < 71; i++){
    var id = "test"+i;
    connection.query(
        `insert into matrix2 (id, real_, predict) value (?,?,?)`,
        [id, 'true', 'true'],
        function(err, result){
            if(err){
                console.log(err)
            }else{
                console.log(result);
            }
        }
    )
}
for (var i = 71; i < 81; i++){
    var id = "test"+i;
    connection.query(
        `insert into matrix2 (id, real_, predict) value (?,?,?)`,
        [id, 'true', 'false'],
        function(err, result){
            if(err){
                console.log(err)
            }else{
                console.log(result);
            }
        }
    )
}
for (var i = 81; i < 101; i++){
    var id = "test"+i;
    connection.query(
        `insert into matrix2 (id, real_, predict) value (?,?,?)`,
        [id, 'false', 'false'],
        function(err, result){
            if(err){
                console.log(err)
            }else{
                console.log(result);
            }
        }
    )
}