var express = require("express");
var router = express.Router();
const request = require('request');
require('dotenv').config();
var Crypto = require("crypto");

var secretKey = process.env.secretKey;

var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");



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
        res.render("login/login", {loggedname : req.session.name});
    })

    router.get("/signup", function(req, res, next){
        res.render("login/signup", {loggedname : req.session.name})
    })

    router.post("/signup", function(req, res, next){
        var id = req.body.id;
        var password = req.body.pass;
        var name = req.body.name;
        var birth = req.body.birth;
        var email = req.body.email;
        var phone = req.body.phone;
        var linkcode = req.body.linkcode;
        var encrypted = Crypto.createHmac('sha256', secretKey).update(password).digest('hex');
        console.log(encrypted);
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
                            `insert into user (id, password, name, email, phone, linkcode) values (?,?,?,?,?,?)`,
                            [id, encrypted, name, email, phone, linkcode],
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
        var encrypted = Crypto.createHmac('sha256', secretKey).update(pass).digest('hex');
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        connection.query(
            `select * from user where id = ? and password = ?`,
            [id, encrypted],
            function(err, result){
                if(err){
                    console.log("login err", err)
                }else{
                    if(result.length > 0){
                        req.session.user = result[0].id;
                        req.session.name = result[0].name;
                        req.session.phone = result[0].phone;
                        req.session.email = result[0].email;
                        req.session.logintime = date;

                        if(result[0].linkcode == "0"){
                            connection.query(
                                `select * from concert where register=?`,
                                [req.session.user],
                                function(err, result){
                                    if(err){
                                        console.log("login manager err => ", err)
                                        res.redirect("/login")
                                    }else{
                                        res.render("manager/main", {concert : result, loggedname : req.session.name});
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
                                        connection.query(
                                            `insert into login (id, login) values (?,?)`,
                                            [req.session.user, req.session.logintime],
                                            function(err2, result2){
                                                if(err2){
                                                    console.log("login time DB insert => " , err2)
                                                    res.redirect("/login")
                                                }else{
                                                    console.log(result);
                                                    res.render("index_1", {concert : result, loggedname : req.session.name});
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    } else{
                        console.log("아이디나 비밀번호가 맞지 않습니다.")
                        res.redirect("/login")
                    }
                }
            }
        )
    })

    router.get("/main", function(req, res, next){
        res.redirect("/manager/main")
    })

    var mypage_ticket;
    var ticket_used;
    var mypage_user;

    router.get("/mypage", function(req, res, next){
        connection.query(
            `select * from user where id = ?`,
            [req.session.user],
            function(err2, result2){
                if(err2){
                    console.log(err)
                }else{
                    mypage_user = result2;
                    next();  
                }
            }
        )
    })

    router.get("/mypage", function(req, res, next){
        if(!req.session.user){
            res.redirect("/login")
        }else{
            res.render("login/mypage", {loggedname : req.session.name, loggedemail : req.session.email, ticket : mypage_ticket, user: mypage_user});
        }
    })


    router.get("/ticket_wallet", function(req, res, next){
        connection.query(
            `select * from ticket where user =? and state = 9`,
            [req.session.user],
            function(err, result){
                if(err){
                    console.log("mypage select error => ", err)
                }else{
                    ticket_used = result;
                }
            }
        )
        connection.query(
            `select * from ticket where user =? and state = 1`,
            [req.session.user],
            function(err, result){
                if(err){
                    console.log("mypage select error => ", err)
                }else{
                    mypage_ticket = result;
                    connection.query(
                        `select * from user where id = ?`,
                        [req.session.user],
                        function(err2, result2){
                            if(err2){
                                console.log(err)
                            }else{
                                mypage_user = result2;
                                next();  
                            }
                        }
                    )
                }
            }
        )
    })

    router.get("/ticket_wallet", function(req, res, next){
        req.session.confirm = 2;
        if(!req.session.user){
            res.redirect("/login")
        }else{
            res.render("login/mywallet", {loggedname : req.session.name, loggedemail : req.session.email, ticket : mypage_ticket, ticket_used : ticket_used , user: mypage_user, wallet: req.session.wallet});
        }
    })


    
    return router;
}