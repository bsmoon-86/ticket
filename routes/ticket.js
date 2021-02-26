var express = require("express");
var router = express.Router();
const request = require('request');
require('dotenv').config();
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


module.exports = function(){

    router.get("/", function(req, res, next){
        var concertId = req.query.concertId;
        res.render("confirm/login", {concertId: concertId, loggedname : req.session.name});
    })

    
    //세부 티켓의 정보 확인 페이지 
    router.get("/ticket_info", function(req, res, next){
        var ticketId = req.query.ticket;
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        console.log(ticketId);
        connection.query(
            `select * from ticket where ticketId = ?`,
            [ticketId],
            function(err, result){
                if(err){
                    console.log("ticket_info sql error => ", err)
                }else{
                    console.log("ticket_info => ", result)
                    res.render("ticket/myticket", {ticket : result, loggedname : req.session.name, date : date});
                }
            }
        )
    })

    //티켓 조회 페이지 
    router.get("/search", function(req, res, next){
        res.render("ticket/myticket_search" ,{loggedname : req.session.name});
    })
    

     //티켓 정보 조회 (로그인 없이 가능)
    router.post("/search", function(req, res, next){    
        var ticketId = req.body.ticketId;

        connection.query(
            `select * from ticket where ticketId=?`,
            [ticketId],
            function(err, result){
                if(result.length > 0){
                    let options = {
                        uri: "http://kairos-link.iptime.org:8080/api/v1/get_ticket?concertId="+result[0].concertId+"&ticketId="+ticketId,
                        method: 'get'
                    };
                    //console.log(options);
                    request.get(options, function(err,httpResponse,body){
                        if(err){
                        console.log(err)
                        }else{
                        console.log(httpResponse);
                        console.log(body.split(","));
                        res.render("ticket/search_ticket" ,{ticket : result, user : body.split(","), loggedname : req.session.name})
                        // ticket.push(body);
                        }
                    })
                }else{
                    res.redirect("/error")
                }

            }
        )
    })

    router.post("/transfer", function(req, res, next){
        var ticket = req.body.ticketId;
        var concertId;
        var ticketId;
        connection.query(
            `select * from ticket where ticketId = ?`,
            [ticket],
            function(err, result){
                if(err){
                    console.log("transfer error => ", err)
                }else{
                    concertId = result[0].concertId;
                    ticketId = result[0].ticketId;
                    connection.query(
                        `select id from user where linkcode='1'`,
                        function(err2, result2){
                            console.log(result2);
                            res.render("ticket/myticket_transfer", {loggedname: req.session.name, concertId : concertId, ticketId: ticketId, user: result2});
                        }
                    )
                }
            }
        )
    })

    router.post("/check", function(req, res, next){
        var id = req.body.id;
        console.log(id)
        connection.query(
            `select * from user where id = ?`,
            [id],
            function(err, result){
                if(err){
                    console.log("check select error =>" , err)
                }else{
                    if(result.length > 0){
                        res.send(true);
                    }else{
                        res.send(false);
                    }
                }
            }
        )
    })

    

    // //티켓 확인
    // router.post("/search", function(req, res, next){    
    //     var concertId = req.body.concertId;
    //     // var ticketId = req.body.ticketId;
    //     var ticket = [];
    //     connection.query(`select * from ticket where concertId =?`,
    //     [concertId],
    //     async function(err, result){
    //         if(err){
    //             console.log("err", err)
    //         }else{
    //             //console.log(result.length)
    //             for(var i=0; i < result.length; i++){            
    //                 let options = {
    //                     uri: "http://kairos-link.iptime.org:8080/api/v1/get_ticket?concertId="+concertId+"&ticketId="+i,
    //                     method: 'get'
    //                 };
    //                 //console.log(options);
    //                 request.get(options, function(err,httpResponse,body){
    //                     if(err){
    //                     console.log(err)
    //                     }else{
    //                     console.log(body);
    //                     ticket.push(body);
    //                     }
    //                 })
    //             };    
    //             console.log(ticket)
    //             res.json(ticket);
    //         }
    //     }
    //     )
    //     //res.render("ticket/view copy", {data: body, concertId: concertId, ticketId: ticketId});
    // })


    //티켓 등록 
    router.post("/regist", async function(req, res, next){
        if(!req.session.name){
            res.redirect("/login")
        }else{
            var concertId = req.body.concertId;
            var ticketId = req.body.ticketId;
            var date = req.body.date;
            var time = req.body.time;
            var seat = req.body.seat;
            var price = req.body.price;
            var discount = "0";
            var discountRate = 0;
            var fee = req.body.fee;
            var cancleDate = req.body.cancleDate;
            var cancleFee = req.body.cancleFee;    

            let options = {
                uri: "http://kairos-link.iptime.org:8080/api/v1/regist_ticket",
                method: 'post',
                json: {
                    concertId: concertId,
                    ticketId: ticketId,
                    date: date,
                    time: time,
                    seat: seat,
                    discount: discount,
                    price: price,
                    discountRate: discountRate,
                    fee: fee,
                    cancleDate: cancleDate,
                    cancleFee: cancleFee,
                },
            };
            request.post(options, function(err,httpResponse,body){
                if(err){
                    console.log(err)
                }else{        
                    connection.query(                               //블록에 티켓 정보를 저장 후 DB에도 같은 정보를 저장
                        `insert into ticket (concertId, ticketId, date, time, seat, discount, price,
                        discountRate, fee, cancleDate, cancleFee, state) values (?,?,?,?,?,?,?,?,?,?,?,0)`,
                        [concertId, ticketId, date, time, seat, discount, price, discountRate, fee, cancleDate, cancleFee],
                        function(err, result){
                            if(err){
                                console.log(err)
                            }else{
                                console.log(body)
                                res.redirect("/")
                            }
                        }
                    )
                }
            })
        }
    })

    //티켓 정보 변경
    router.post("/update", function(req, res, next){
        var concertId = req.body.concertId;
        var ticketId = req.body.ticketId;
        var date = Number(req.body.date);
        var time = Number(req.body.time);
        var seat = req.body.seat;
        var discount = req.body.discount;
        var price = req.body.price;
        var discountRate = Number(req.body.discountRate);
        var fee = Number(req.body.fee);
        var cancleDate = req.body.cancleDate;
        var cancleFee = req.body.cancleFee;    
        let options = {
            uri: "http://kairos-link.iptime.org:8080/api/v1/update_ticket",
            method: 'post',
            json: {
                concertId: concertId,
                ticketId: ticketId,
                date: date,
                time: time,
                seat: seat,
                discount: discount,
                price: price,
                discountRate: discountRate,
                fee: fee,
                cancleDate: cancleDate,
                cancleFee: cancleFee
            },
        };
        request.put(options, function(err,httpResponse,body){
            if(err){
                console.log(err)
            }else{
                connection.query(
                    `update ticket set concertId = ? , ticketId = ?, date = ?, time = ?, seat = ?, discount = ?, price = ?, 
                    discountRate = ?, fee = ?, cancleDate = ?, cancleFee = ? where concertId = ? and ticketId = ?`,
                    [concertId, ticketId, date, time, seat, discount, price, discountRate, fee, cancleDate, cancleFee, concertId, ticketId],
                    function(err, result){
                        if(err){
                            console.log(err)
                        }else{
                            console.log(result)
                            res.redirect("/ticket")
                        }
                    }
                )
            }
        })
    })

    router.post("/payment", function(req, res, next){
        var concertId = req.body.concertId;
        var ticketId = req.body.ticketId;
        var did = req.body.did.split(",");
        var payment = req.body.payment;
        console.log(did[0]);
        let options = {
            uri: "http://kairos-link.iptime.org:8080/api/v1/buy_ticket",
            method: 'post',
            json: {
                concertId: concertId,
                ticketId: ticketId,
                ticketerName : did[1],
                ticketerPhoneNumber : did[2],
                ticketerEmail : did[0]
            },
        };
        request.post(options, function(err,httpResponse,body){
            if(err){
            console.log(err)
            }else{
                console.log(body)
                res.redirect("/ticket")
            }
        })
    })

    

    //티켓 소유자 변경
    router.post("/transfer2", function(req, res, next){
        var concertId = req.body.concertId;
        var ticketId = req.body.ticketId;
        var transferId = req.body.transferticketer;
        var ticketerName ="";
        var ticketerPhoneNumber = "";
        var ticketerEmail = "";
        console.log(transferId);

        connection.query(
            `select * from user where id = ?`,
            [transferId],
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    console.log(result)
                    ticketerName = result[0].name;
                    ticketerPhoneNumber = result[0].phone;
                    ticketerEmail = result[0].email;
                    let options = {
                        uri: "http://kairos-link.iptime.org:8080/api/v1/transfer_ticket",
                        method: 'post',
                        json: {
                            concertId: concertId,
                            ticketId: ticketId,
                            transferTicketerName : ticketerName,
                            transferTicketerPhoneNumber : ticketerPhoneNumber,
                            transferTicketerEmail : ticketerEmail
                        },
                    };
                    request.post(options, function(err,httpResponse,body){
                        if(err){
                        console.log(err)
                        }else{
                            console.log(body)
                            connection.query(
                                `update ticket set user =? , name =? where ticketId =?`,
                                [transferId, ticketerName, ticketId],
                                function(err2, result2){
                                    if(err2){
                                        console.log("ticket trans update error =", err2)
                                    }else{
                                        console.log(result2);
                                        res.redirect("/login/ticket_wallet")
                                    }
                                }
                            )
                        }
                    })

                }
            }
        )

    })

    return router;
}