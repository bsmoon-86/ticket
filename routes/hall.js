var express = require("express");
var router = express.Router();
const request = require('request');
require('dotenv').config();



var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port, // db 포트
  user: process.env.user, // user 이름
  password: process.env.password, // 비밀번호
  database: process.env.database, // database 이름
});

module.exports = function() {
    
    router.get("/", function(req, res, next){
        res.render("hall/index");
    })


    //공연 등록
    router.route("/regist2").post(function(req, res, next){ 
        var name = req.body.name;                                      
        var address = req.body.address;
        var phone = req.body.phone;
        var seat1 = req.body.seat1;
        var seat2 = req.body.seat2;
        var seat3 = req.body.seat3;
        var seat4 = req.body.seat4;
        var seat5 = req.body.seat5;
            connection.query(
                `insert into hall (name, address, phone, seat1, seat2, seat3, seat4, seat5) 
                values (?,?,?,?,?,?,?,?)`,
                [name, address, phone, seat1, seat2, seat3, seat4, seat5],
                function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                    console.log(result);
                    res.redirect("/")
                    }
                }
            )
    })

    return router;
}