var express = require("express");
var router = express.Router();
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy;
const request = require('request');
require('dotenv').config();
var Crypto = require("crypto");

var secretKey = process.env.secretKey;

var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

var kakao_id;

passport.use('kakao', new KakaoStrategy({
    clientID: process.env.kakaoid,
    clientSecret: process.env.kakaosecret,
    callbackURL: 'http://www.tget.co.kr/login/main_kakao',     // 위에서 설정한 Redirect URI
  }, async (accessToken, refreshToken, profile, done) => {
      console.log(refreshToken);
    console.log(`accessToken : ${accessToken}`)
      console.log(`사용자 profile: ${JSON.stringify(profile._json)}`)
      kakao_id = profile._json;
    //   return done(accessToken);

    // //save(accessToken, refreshToken, profile)
      return done(null, profile._json)
}
))


var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port, // db 포트
  user: process.env.user, // user 이름
  password: process.env.password, // 비밀번호
  database: process.env.database, // database 이름
});

var check_login = 0;


module.exports = function() {

    /**
     * 로그인 페이지
     */
    router.get("/", function(req, res, next){
        req.session.destroy(function (err2) {
            if (err2) {
              console.log(err2);
              res.render("error");
            } else {
                res.render("login/login", {loggedname : null, check: check_login, did:null});
            }
          }); 
    })



    /**
     * 회원가입 페이지
     */
    router.get("/signup", function(req, res, next){
        res.render("login/signup", {loggedname : req.session.name})
    })

    /**
     * 회원가입 페이지(카카오)
     */
    router.get("/signup2", function(req, res, next){
        console.log(kakao_id.id);
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        connection.query(
            `select * from user where kakao_id = ?`,
            [kakao_id.id],
            function(err, result){
                if(err){
                    res.render('error');
                }else{
                    if(result.length > 0){
                        req.session.user = result[0].id;
                        req.session.name = result[0].name;
                        req.session.phone = result[0].phone;
                        req.session.email = result[0].email;
                        req.session.logintime = date;
                        res.redirect("/");
                    }else{
                        res.render("login/signup_kakao", {loggedname : req.session.name})
                    }
                }
            }
        )
    })

    /**
     * 회원가입 DB 저장
     * 해당 ID의 중복 여부 확인 후 중복이 아니면 회원가입
     */
    router.post("/signup", function(req, res, next){
        var id = req.body.id;
        var password = req.body.pass;
        var name = req.body.name;
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

    /**
     * 회원가입 DB 저장
     * 해당 ID의 중복 여부 확인 후 중복이 아니면 회원가입
     */
    router.post("/signup_kakao", function(req, res, next){
        function guid() {
            function s4() {
                return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
            }
            return s4();
        }
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var linkcode = 1;
        var encrypted = Crypto.createHmac('sha256', secretKey).update(guid()).digest('hex');
        var id = phone+"_kakao";
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
                        res.render('error');
                    }else{
                        connection.query(
                            `insert into user (id, password, name, email, phone, linkcode, kakao_id) values (?,?,?,?,?,?,?)`,
                            [id, encrypted, name, email, phone, linkcode, kakao_id.id],
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

    // router.get("/find", function(req, res, next){
    //     res.render("login/idpw-find");
    // })

    /**
     * 로그인 성공시 메인 페이지
     * 관리자 계정으로 로그인 시 관리자 페이지로 이동 (회원 DB의 linkcode가 0은 관리자, 1은 유저)
     * 로그인 실패시 로그인 화면
     */
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
                        check_login = 1;
                        res.redirect("/login")
                    }
                }
            }
        )
    })

    var mypage_ticket;
    var ticket_used;
    var mypage_user;

    /**
     * 마이 페이지
     * 회원 정보 표시
     */
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


    /**
     * 티켓 지갑 화면
     * 로그인 한 유저가 소유한 티켓의 정보를 표시
     * 사용한 티켓과 사용하지 않은 티켓으로 구분하여 표시(ticket DB의 state가 1이면 사용 전, 9면 사용, 0은 구매 전 티켓)
     */
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

    router.get('/kakao', passport.authenticate('kakao'));

    router.get('/main_kakao', passport.authenticate('kakao',{
        successRedirect: "/login/signup2",
        session: false,
        failureRedirect: '/error',
        }), function(res, req){
            console.log("123456789");
        }
    );
    
    return router;
}