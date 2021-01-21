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
        res.render("login/login");
    })

    router.get("/signup", function(req, res, next){
        res.render("login/signup")
    })

    router.post("/signup2", function(req, res, next){
        var id = req.body.id;
        var password = req.body.pass;
        var name = req.body.name;
        var birth = req.body.birth;
        var email = req.body.email;
        var phone = req.body.phone;
        var linkcode = req.body.linkcode;
        connection.query(
            `select * from user where id =?`,
            [id],
            function(err, result){
                if(err){
                    console.log("err", err)
                }else{
                    if(result.length > 0){
                        console.log("존재하는 id")
                    }else{
                        connection.query(
                            `insert into user (id, pass, name, birth, email, phone, linkcode) values (?,?,?,?,?,?,?)`,
                            [id, password, name, birth, email, phone, linkcode],
                            function(err, result){
                                if(err){
                                    console.log("err", err)
                                }else{
                                    console.log(result);
                                    res.redirect("/login")
                                }
                            }
                        )
                    }
                }
            }
        )
    })

    router.get("/find", function(req, res, next){
        res.render("login/idpw-find");
    })

    router.post("/main", function(req, res, next){
        var id = req.body.id;
        var pass = req.body.pass;
        connection.query(
            `select * from user where id = ? and password = ?`,
            [id, pass],
            function(err, result){
                if(err){
                    console.log("login err", err)
                }else{
                    if(result.length > 0){
                        req.session.user = result[0].id;
                        req.session.name = result[0].name;
                        req.session.phone = result[0].phone;
                        req.session.email = result[0].email;

                        if(result[0].linkcode == "0"){
                            connection.query(
                                `select * from concert where register=?`,
                                [req.session.user],
                                function(err, result){
                                    if(err){
                                        console.log("login manager err => ", err)
                                    }else{
                                        res.render("manager/main", {concert : result});
                                    }
                                }
                            )
                        }else{
                            connection.query(
                                `select * from concert`,
                                function(err, result){
                                    if (err){
                                        console.log(err);
                                    }else{
                                        console.log(result);
                                        res.render("index_1", {concert : result, loggedname : req.session.name});
                                    }
                                }
                            )
                        }
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

    router.get("/mypage", function(req, res, next){
        if(!req.session.user){
            res.redirect("/login")
        }else{
            var concert = [];

            var function1 = async function query(result){
                for(var i=0;i <result.length;i++){
                    connection.query(
                        `select * from concert where id =?`,
                        [result[i].concertId],
                        function(err, result2){
                            if(err){
                                console.log("poster reload error => ", err)
                            }else{
                                concert.push(result2[0]);
                                console.log(concert);
                            }
                        }
                    )
                }
                
                return poster;
            }

            connection.query(
                `select * from ticket where user =?`,
                [req.session.user],
                function(err, result){
                    if(err){
                        console.log("mypage select error => ", err)
                    }else{
                        function1(result).then(function(result2){
                            console.log(result2);
                        
                    })
                    setTimeout(function(){
                        res.render("login/mypage", {loggedname : req.session.name, loggedemail : req.session.email, ticket : result, concert : concert});
                    }, 500);
                        
                    }
                }
            )

        }
    })

    
    return router;
}