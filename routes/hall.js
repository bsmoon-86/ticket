var express = require("express");
var router = express.Router();
const request = require('request');

var mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'test'
})

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