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
        // console.log(concert)

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
                            res.render("concert/reserve", {data: body, concert: result, poster_img: result[0].poster_img , info_img: result[0].info_img, loggedname : req.session.name});   
                        }
                    }
                )              
            }
        })
    })


    router.post("/select", function(req, res, next){
        var mykeepin = require('../Library/mykeepin-verify-sdk/example/example');
        const person = function test(){
            return mykeepin();
        }
        
        person().then(function(result2){
            console.log(result2[1]);
            if(result2[1] == req.session.name){
                next();
            }else{
                    res.render("error")
            }

        })
        
        // if(!req.session.name){
        //     res.redirect("/login")
        // }else{
        // }  
        // console.log(req.session.name);

    })
    
    
    //좌석 선택 
    router.post("/select", function(req, res, next){
        //var did = req.body.did;
            var date = req.body.date;
            var time = req.body.time;
            var concertId = req.body.concertId;
            
            connection.query(
                `select * from concert where id=?`,
                [concertId],
                function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                    console.log(result);
                        connection.query(
                            `select * from hall where name=?`,
                            [result[0].place],
                            function(err, result2){
                                if(err){
                                    console.log("select => ", err)
                                }else{
                                    connection.query(
                                        `select * from ticket where concertId = ?`,
                                        [concertId],
                                        function(err, result3){
                                            var min = Math.ceil(1);
                                            var max = Math.floor(4);
                                            var ran = Math.floor(Math.random() * (max - min)) + min; 
                                            if(err){
                                                console.log("select2 => ", err)
                                            }else{
                                                if(result[0].genre == 0){
                                                    res.render("concert/seat_selection"+ran, {concert: result, hall: result2[0], ticket: result3, time : time, date : date, loggedname : req.session.name});   
                                                }else if(result[0].genre == 1){
                                                    res.render("concert/seat_selection", {concert: result, hall: result2[0], ticket: result3, time : time, date : date, loggedname : req.session.name});   
                                                }else if(result[0].genre == 2){
                                                    res.render("concert/seat_selection_sport"+ran, {concert: result, hall: result2[0], ticket: result3, time : time, date : date, loggedname : req.session.name});   
                                                }else if(result[0].genre == 3){
                                                    res.render("concert/seat_selection_sport"+ran, {concert: result, hall: result2[0], ticket: result3, time : time, date : date, loggedname : req.session.name});   
                                                }
                                            }
                                        }
                                    )

                                }

                            }
                        )
                            
                    }
                }
            )   
    })
    //티켓 결제 페이지 이동
    router.post("/payment", function(req, res, next){
        if(!req.session.name){
            res.redirect("/login")
        }else{
            var concertId = req.body.concertId;
            var date = req.body.date;
            var time = req.body.time;
            var x = req.body.x;
            var y = req.body.y;
            var time_rap = req.body.time_rap;
            var seat = req.body.seat;
            var price = req.body.price;
            connection.query(
                `select * from concert where id=?`,
                [concertId],
                function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                        res.render("concert/payment", {x:x, y:y, time_rap:time_rap, date: date, time: time, seat: seat, price: price,  concertId : concertId, concert: result, loggedname : req.session.name});
                    }
                }
            )
        }

    })


    //티켓 구매 및 등록
    router.post("/regist", function(req, res, next){
        var concertId = req.body.concertId;
        var ticketId = req.body.ticketId;
        var x = req.body.x;
        var y = req.body.y;
        var time_rap = req.body.time_rap;
        var ticket = ticketId.split(",");
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        console.log(ticket);
        var did = [];
        
        

        var function1 = async function query(ticket_num){
            connection.query(
                `select * from ticket where concertId = ? and seat = ?`,
                [concertId, ticket_num],
                function(err, result){
                    if(err){
                        console.log("regist result => ", err)
                    }else{
                        console.log(result[0])
                        let options = {
                            uri: "http://kairos-link.iptime.org:8080/api/v1/buy_ticket",
                            method: 'post',
                            json: {
                                concertId: result[0].concertId,
                                ticketId: result[0].ticketId,
                                date: result[0].date,
                                time: result[0].time,
                                seat: result[0].seat,
                                discount: "false",
                                price: result[0].price,
                                discountRate: result[0].discountRate,
                                fee: result[0].fee,
                                cancleDate: result[0].cancleDate,
                                cancleFee: result[0].cancleFee,
                                ticketerName : req.session.name,
                                ticketerPhoneNumber : req.session.phone,
                                ticketerEmail : req.session.email
                            },
                        };
                        request.post(options, function(err,httpResponse,body){
                            if(err){
                                console.log(err)
                            }else{     
                                console.log(body);  
                                var mykeepin = require('../Library/mykeepin-verify-sdk/example/example');
                                const person = function test(){
                                    return mykeepin();
                                }
                                person().then(function(result2){
                                    console.log(result2);
                                    did.push(result2);
                                })                                            
                            }
                        })
                    }
                }
            )
        }

        var function2 = async function query(ticket_num){
            connection.query(
                `update ticket set state = ?, user=?, name=? where concertId = ? and seat = ?`,
                [1, req.session.user, req.session.name, concertId, ticket_num],
                function(err, result1){
                    if(err){
                        console.log("regist update = ", err)
                    }else{
                        console.log(result1);
                        console.log(concertId);
                        console.log(ticket_num);
                    }
                }
            )     
        }

        for(var i = 0; i < ticket.length; i++){
            ticket_ = ticket[i];
            function1(ticket[i]).then(function(result){
                console.log(result);
            })
            function2(ticket[i]).then(function(result2){
                console.log(result2);
            })
        }

        
        connection.query(
            `insert mouse (time, time2, x_position, y_position, id, seat) values (?,?,?,?,?,?)`,
            [date, time_rap, x, y, req.session.user, ticketId],
            function(err, mouse){
                if(err){
                    console.log("mouse insert => ", err)
                }else{
                    console.log(mouse);
                }
            }
        )
        res.redirect("/");
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