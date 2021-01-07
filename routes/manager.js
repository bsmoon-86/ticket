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
        res.render("manager/index");
    })

    router.get("/signup", function(req, res, next){
        res.render("manager/signup")
    })

    router.post("/signup2", function(req, res, next){
        var id = req.body.id;
        var password = req.body.pass;
        connection.query(
            `select * from manager where id =?`,
            [id],
            function(err, result){
                if(err){
                    console.log("err", err)
                }else{
                    if(result.length > 0){
                        console.log("존재하는 id")
                    }else{
                        connection.query(
                            `insert into manager (id, pass) values (?,?)`,
                            [id, password],
                            function(err, result){
                                if(err){
                                    console.log("err", err)
                                }else{
                                    console.log(result);
                                    res.redirect("/manager")
                                }
                            }
                        )
                    }
                }
            }
        )
    })

    router.post("/main", function(req, res, next){
        var id = req.body.id;
        var pass = req.body.pass;
        connection.query(
            `select * from manager where id = ? and pass = ?`,
            [id, pass],
            function(err, result){
                if(err){
                    console.log("login err", err)
                }else{
                    if(result.length > 0){
                        res.render("manager/main")
                    } else{
                        console.log("아이디나 비밀번호가 맞지 않습니다.")
                    }
                }
            }
        )
    })

    router.get("/main", function(req, res, next){
        res.redirect("/manager/main")
    })

    
    return router;
}