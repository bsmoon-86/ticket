var express = require("express");
var router = express.Router();
const request = require('request');
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
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

    router.route("/index").get(function(req, res, next){
        var concert = req.query.concert;
        var genre = req.query.genre;                                  
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
                            if(genre == 1){
                                res.render("concert/reserve_exhibition", {data: body, concert: result, poster_img: result[0].poster_img , info_img: result[0].info_img, loggedname : req.session.name});   
                            }else{
                                res.render("concert/reserve", {data: body, concert: result, poster_img: result[0].poster_img , info_img: result[0].info_img, loggedname : req.session.name});   
                            }
                        }
                    }
                )              
            }
        })
    })


    router.post("/select", function(req, res, next){
        var time_rap = req.body.time_rap;
        var time_rap2 = time_rap.split(",");
        var mecro = 0;
        for(var i =0; i < time_rap2.length; i++){
            if(time_rap2[i] < 1000){
                mecro++;
            }
        }
        console.log(mecro);
        // var mykeepin = require('../Library/mykeepin-verify-sdk/example/example');
        // const person = function test(){
        //     return mykeepin();
        // }
        
        // person().then(function(result2){
        //     console.log(result2[1]);
        //     if(result2[1] == req.session.name){
        //         next();
        //     }else{
        //             res.render("error")
        //     }

        // })
        
        if(!req.session.name){
            res.redirect("/login")
        }else{
            if(mecro < 3){
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
                                                if(err){
                                                    console.log("select2 => ", err)
                                                }else{
                                                    var ran = 1;
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
            }else{
                next();
            }
        }  

    })
    
    
    //좌석 선택 
    router.post("/select", function(req, res, next){
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

    router.get("/payment", function(req, res, next){
        if(!req.session.name){
            res.redirect("/login")
        }else{
            var concertId = req.query.concertId;
            var date = req.query.date;
            var seat = req.query.seat;
            var price = req.query.price;
            connection.query(
                `select * from concert where id=?`,
                [concertId],
                function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                        res.render("concert/payment2", {date: date, seat: seat, price: price,  concertId : concertId, concert: result, loggedname : req.session.name});
                    }
                }
            )
        }
    })
    


    //티켓 구매 및 등록
    router.get("/regist", function(req, res, next){
        var concertId = req.query.concertId;
        var ticketId = req.query.ticketId;
        var x = [0];
        var y = [0];
        var time_rap = [0];
        if(req.query.x){
            x = req.query.x;
        }
        if(req.query.y){
            y = req.query.y;
        }
        if(req.query.time_rap){
            time_rap = req.query.time_rap;
        }
        var ticket = ticketId.split(",");
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        console.log(ticket);
        var did = [];
        console.log(req.query.resultCode);
        

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

        if(req.query.resultCode == "Success"){
            var num;
            connection.query(
                `select count(*) as cnt from ticket where concertId = ? and state > 0 and seat like 'b%';`,
                [concertId],
                function(err3, result){
                    if(err3){
                        console.log(err3)
                    }else{
                        console.log("ticket cnt = ",result[0].cnt)
                        num = result[0].cnt+1;
                        
                        for(var i = 0; i < ticket.length; i++){
                            if(ticket[i].substr(0,1) != "자"){
                                function1(ticket[i]).then(function(result){
                                    console.log(result);
                                })
                                function2(ticket[i]).then(function(result2){
                                    console.log(result2);
                                })
                            }else{
                                console.log("ticket substring", ticket[i].substr(3,1));
                                console.log(num);
                                for(var j = 0; j < ticket[i].substr(3,1); j++){
                                    var ticket_num = num + j;
                                    function1("b"+ticket_num).then(function(result){
                                        console.log(result);
                                    })
                                    function2("b"+ticket_num).then(function(result2){
                                        console.log(result2);
                                    })
                                }
                            }
                        }
                    }
                }
            )
        
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
        }else{
            res.render("error")
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