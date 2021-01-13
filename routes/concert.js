var express = require("express");
var router = express.Router();
const request = require('request');
var moment = require("moment");
require("moment-timezone");
require('dotenv').config();
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
    

    router.route("/index").get(function(req, res, next){
        var concert = req.query.concert;                                
        console.log(concert)

        let options = {                                                                     //request에 들어갈 옵션 값 url, method, json 값 등록
            uri: "http://kairos-link.iptime.org:8080/api/v1/get_concert?concertId="+concert,
            method: 'get',
            json:true //json으로 보낼경우 true로 해주어야 header값이 json으로 설정됩니다.
        };
        request.get(options, function(err,httpResponse,body){                               //contract를 통하여 받은 return 값은 body라는 변수로 등록
            if(err){
            console.log(err)
            }else{
            console.log(body);
            connection.query(
                `select * from concert where id=?`,
                [concert],
                function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                      console.log(result);
                      connection.query(
                          `select * from ticket where concertId = ?`,
                          [concert],
                          function(err2, result2){
                              if(err2){
                                  console.log("err2 =", err2)
                              }else{
                                  console.log(result2);
                                res.render("concert/reserve", {data: body, concert: result, poster_img: result[0].poster_img , info_img: result[0].info_img, ticket:result2, loggedname : req.session.name});   
                              }
                          }
                      )
                    }
                }
              )              
            }
        })
    })

    
    //좌석 선택 
    router.post("/select", function(req, res, next){
        //var did = req.body.did;
        console.log(req.session.name);
        if(!req.session.name){
            res.redirect("/login")
        }else{
            var date = req.body.date;
            var time = req.body.time;
            var concertname = req.body.concertname;
            var concertId = req.body.concertId;
            var mykeepin = require('../Library/mykeepin-verify-sdk/example/example');
            const person = function test(){
                return mykeepin();
            }
            person().then(function(result){
                console.log(result[0]);
                console.log("date=", date, "time=", time, "concertId =", concertId);
                res.render("concert/seat_selection" ,{did : result, date : date, time : time ,concertId : concertId, concertname : concertname, loggedname : req.session.name});
            })
        }
    })

    router.post("/payment", function(req, res, next){
        console.log(req.session.name);
        console.log(x);
        console.log(y);
        if(!req.session.name){
            res.redirect("/login")
        }else{
            var concertId = req.body.concertId;
            var date = req.body.date;
            var time = req.body.time;
            var x = req.body.x;
            var y = req.body.y;
            var time_rap = req.body.time_rap;
            res.render("concert/payment", {x:x, y:y, time_rap:time_rap, date: date, time: time, concertId : concertId, loggedname : req.session.name});
        }

    })


    //공연 변경
    router.route("/update").post(function(req, res, next){ 
        var concertId = req.body.concertId;                                     
        var name = req.body.name;
        var place = req.body.place;
        var date = Number(req.body.date);
        var time = req.body.time;
        var showtime = req.body.showtime;
        var genre = req.body.genre;
        var rating = req.body.rating;
        var url1 = req.body.url1;
        var url2 = req.body.url2;
        var seat1 = req.body.seat1;
        var seat2 = req.body.seat2;
        var seat3 = req.body.seat3;
        var seat4 = req.body.seat4;
        var seat5 = req.body.seat5;
        let options = {                                                                     //request에 들어갈 옵션 값 url, method, json 값 등록
            uri: "http://kairos-link.iptime.org:8080/api/v1/update_concert",
            method: 'put',
            json: {
                concertId : concertId,
                name:  name,
                place: place,
                date: date
            },
        };
        console.log(options);
        request.put(options, function(err,httpResponse,body){
            if(err){
            console.log(err)
            res.redirect("/concert")
            }else{
                connection.query(
                  `update concert set name =?, place =?, date=?, time=?, showtime=?, genre=?, rating=?, poster_img=?, info_img=?, seat1=?, seat2=?, seat3=?, seat4=?, seat5=? where id=?`,
                  [name, place, date, time, showtime, genre, rating, url1, url2, seat1, seat2, seat3, seat4, seat5, concertId],
                  function(err, result){
                      if (err){
                          console.log(err);
                      }else{
                        console.log(body);
                        res.redirect("/")
                      }
                  }
                )
            }
        })
    })

 
    
    return router;
}