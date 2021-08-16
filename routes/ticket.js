var express = require("express");
var router = express.Router();
const request = require('request');
const QRCode = require('qrcode')
require('dotenv').config();
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

const bc_host = process.env.bc_host;


var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port, // db 포트
  user: process.env.user, // user 이름
  password: process.env.password, // 비밀번호
  database: process.env.database, // database 이름
});


module.exports = function(){
    
    /**
     * 티켓 정보 조회 화면
     * 이미 사용된 티켓은 myticket2로 이동
     * 사용되지 않은 티켓은 myticket으로 이동
     */
    router.get("/ticket_info", function(req, res, next){
        var ticketId = req.query.ticket;
        var used = req.query.used;
        var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
        console.log(ticketId);
        connection.query(
            `select * from ticket where ticketId = ?`,
            [ticketId],
            function(err, result){
                if(err){
                    console.log("ticket_info sql error => ", err)
                }else{
                    if(used == 0){
                        console.log("ticket_info => ", result)
                        res.render("ticket/myticket", {ticket : result, loggedname : req.session.name, date : date});
                    }else{
                        console.log("ticket_info =>", result, "used => 2")
                        res.render("ticket/myticket2", {ticket : result, loggedname : req.session.name, date : date});
                    }
                }
            }
        )
    })

    /**
     * 티켓 조회 화면
     */
    router.get("/search", function(req, res, next){
        res.render("ticket/myticket_search" ,{loggedname : req.session.name});
    })
    

    /**
     * 조회된 티켓 정보 화면
     * BlockChain의 티켓 데이터를 표시
     */
    router.post("/search", function(req, res, next){    
        var ticketId = req.body.ticketId;

        connection.query(
            `select * from ticket where ticketId=?`,
            [ticketId],
            function(err, result){
                if(result.length > 0){
                    let options = {
                        uri: bc_host+"/api/v1/get_ticket?concertId="+result[0].concertId+"&ticketId="+ticketId,
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

    /**
     * 티켓 qrcode 화면
     */
    router.get("/qrcode", function(req , res, next){
        var ticketId = req.query.ticketId;
        var name = req.query.name;
        var time = moment().format("YYYYMMDDHHmmss");
        var seat = req.query.seat;

        var a = seat.substring(0,1);
        if(a == "v"){
            var floor = 1;
        }else if(a == "r"){
            var floor = 1;
        }else{
            var floor = 2;
        }
        
        var string = JSON.stringify({
            "ticketId":ticketId,
            "name":name,
            "time":time,
            "floor": floor
        });
        console.log(string);
        QRCode.toDataURL(string,{type:'terminal'}, function (err, url) {
          if(err) throw err;
         //console.log(url);
         let data = url.replace(/.*,/,'')
            let img = new Buffer(data,'base64')
            res.writeHead(200,{
                'Content-Type' : 'image/png',
                'Content-Length' : img.length
            })
            res.end(img)
        })
    })

    /**
     * 티켓 양도 화면
     * 티켓 지갑 -> 티켓 상세 정보 -> 양도하기 
     */
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

    /**
     * 티켓 양도 페이지에서 양도받을 아이디 유무 체크
     */
    router.post("/check", function(req, res, next){
        var id = req.body.id;
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

    /**
     * 티켓의 소유주 변경
     * 티켓의 소유주 정보를 BlockChain 및 DB에 변경하여 저장
     */
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
                        uri: bc_host+"/api/v1/transfer_ticket",
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