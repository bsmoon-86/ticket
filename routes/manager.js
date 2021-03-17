var express = require("express");
var router = express.Router();
const request = require('request');
require('dotenv').config();
var Crypto = require("crypto");

var secretKey = process.env.secretKey;


var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port, // db 포트
  user: process.env.user, // user 이름
  password: process.env.password, // 비밀번호
  database: process.env.database, // database 이름
});

module.exports = function() {
    
    /**
     * 관리자 메인 화면
     */
    router.get("/", function(req, res, next){
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
    })

    /**
     * 공연 등록 화면
     */
    router.route("/regist").get(function(req, res, next){
        connection.query(
            `select * from hall`,
            function(err, result){
                if(err){
                    console.log("err". err)
                }else{
                    console.log(result);
                    res.render("manager/concert_regist", {hall: result})
                }
            }
        )
    })

    /**
     * 공연 등록 및 티켓 자동 생성
     * 공연의 정보를 공연 DB 및 BlockChain에 등록
     * 좌석의 갯수는 공연장의 DB 에서 불러와서 티켓을 자동으로 생성 
     * 전시의 경우는 999장 자동 생성
     */
    router.route("/regist2").post(function(req, res, next){ 
        var concertId = req.body.concertId;                                      
        var name = req.body.name;
        var place = req.body.place;
        var date = req.body.date.replace(/\-/g,"");
        var time = req.body.time.replace(":","");
        var showtime = req.body.showtime;
        var genre = req.body.genre;
        var rating = req.body.rating;
        var url1 = req.body.url1;
        var url2 = req.body.url2;
        var seat1 = 0;
        if(req.body.seat1){
            seat1 = req.body.seat1;
        }
        var seat2 = 0;
        if(req.body.seat2){
            seat1 = req.body.seat2;
        }
        var seat3 = 0;
        if(req.body.seat3){
            seat1 = req.body.seat3;
        }
        var seat4 = 0;
        if(req.body.seat4){
            seat1 = req.body.seat4;
        }
        var seat5 = 0;
        if(req.body.seat5){
            seat1 = req.body.seat5;
        }
        var vip = req.body.vip;
        var r = req.body.r;
        var s = req.body.s;
        var a = req.body.a;
        var b = req.body.b;

        console.log(date)
        console.log(time)

        console.log(vip, r, s, a, b);

        for(var i = 0; i < vip; i++){
            var ticket = concertId+"-"+"vip"+i;
            var encrypted = Crypto.createHmac('sha256', secretKey).update(ticket).digest('hex');
            connection.query(
                `insert into ticket (concertId, ticketId, date, time, seat, price, discount, discountRate, 
                    fee, cancleDate, cancleFee, state, poster_img, c_name, place) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [concertId, encrypted, date, time, "vip"+i, seat1, 0, 0, 0, 0, 0, 0, url1, name, place],
                function(err, result){
                    if(err){
                        console.log("ticket insert error = ", err)
                    }else{
                        console.log(result)
                    }
                }
            )
        }
        for(var i = 0; i < r; i++){
            var ticket = concertId+"-"+"r"+i;
            var encrypted = Crypto.createHmac('sha256', secretKey).update(ticket).digest('hex');
            connection.query(
                `insert into ticket (concertId, ticketId, date, time, seat, price, discount, discountRate, 
                    fee, cancleDate, cancleFee, state, poster_img, c_name, place) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [concertId, encrypted, date, time, "r"+i, seat2, 0, 0, 0, 0, 0, 0, url1, name, place],
                function(err, result){
                    if(err){
                        console.log("ticket insert error = ", err)
                    }else{
                        console.log(result)
                    }
                }
            )
        }
        for(var i = 0; i < s; i++){
            var ticket = concertId+"-"+"s"+i;
            var encrypted = Crypto.createHmac('sha256', secretKey).update(ticket).digest('hex');
            connection.query(
                `insert into ticket (concertId, ticketId, date, time, seat, price, discount, discountRate, 
                    fee, cancleDate, cancleFee, state, poster_img, c_name, place) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [concertId, encrypted, date, time, "s"+i, seat3, 0, 0, 0, 0, 0, 0, url1, name, place],
                function(err, result){
                    if(err){
                        console.log("ticket insert error = ", err)
                    }else{
                        console.log(result)
                    }
                }
            )
        }
        for(var i = 0; i < a; i++){
            var ticket = concertId+"-"+"a"+i;
            var encrypted = Crypto.createHmac('sha256', secretKey).update(ticket).digest('hex');
            connection.query(
                `insert into ticket (concertId, ticketId, date, time, seat, price, discount, discountRate, 
                    fee, cancleDate, cancleFee, state, poster_img, c_name, place) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [concertId, encrypted, date, time, "a"+i, seat4, 0, 0, 0, 0, 0, 0, url1, name, place],
                function(err, result){
                    if(err){
                        console.log("ticket insert error = ", err)
                    }else{
                        console.log(result)
                    }
                }
            )
        }
        for(var i = 0; i < b; i++){
            var ticket = concertId+"-"+"b"+i;
            var encrypted = Crypto.createHmac('sha256', secretKey).update(ticket).digest('hex');
            connection.query(
                `insert into ticket (concertId, ticketId, date, time, seat, price, discount, discountRate, 
                    fee, cancleDate, cancleFee, state, poster_img, c_name, place) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [concertId, encrypted, date, time, "b"+i, seat5, 0, 0, 0, 0, 0, 0, url1, name, place],
                function(err, result){
                    if(err){
                        console.log("ticket insert error = ", err)
                    }else{
                        console.log(result)
                    }
                }
            )
        }


        let options = {                                                                     //request에 들어갈 옵션 값 url, method, json 값 등록
            uri: "http://kairos-link.iptime.org:8080/api/v1/regist_concert",
            method: 'post',
            json: {
                concertId : concertId,
                name:  name,
                place: place,
                date: date 
            },
        };
        request.post(options, function(err,httpResponse,body){
            if(err){
            console.log(err)
            res.redirect("/concert")
            }else{
                connection.query(
                  `insert into concert (id, name, place, date, time, showtime, genre, rating, poster_img, info_img, seat1, seat2, seat3, seat4, seat5, register) 
                  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [concertId, name, place, date, time, showtime, genre, rating, url1, url2, seat1, seat2, seat3, seat4, seat5, req.session.user],
                  function(err, result){
                      if (err){
                          console.log(err);
                      }else{
                        console.log(body);
                        res.redirect("/manager")
                      }
                  }
                )
            }
        })
    })

    /**
     * 공연장 등록 화면
     */
    router.route("/hall").get(function(req, res, next){
        res.render("manager/hall_regist");
    })


    /**
     * 공연장 등록
     * 공연장 정보를 공연장 DB에 등록 (공연장은 BlockChain에 등록하지 않는다)
     */
    router.route("/hall2").post(function(req, res, next){ 
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