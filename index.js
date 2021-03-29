var http = require("http");
var express = require("express");
const QRCode = require('qrcode')
const bodyParser = require('body-parser');
var cors = require("cors");
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");
var moment = require("moment");
const request = require('request');
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

var time_diff = 0;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "dndkimleemoonchoi",
    resave: false,
    saveUninitialized: true,
    maxAge: 3600000
  })
);

/**
 * Main 화면
 * get형식으로 genre 값이 존재하면 입력받은 genre의 공연만 보여준다
 */
app.get("/", function (req, res) {
  if(!req.query.genre){
    connection.query(
      `select * from concert`,
      function(err, result){
          if (err){
              console.log(err);
          }else{
            //console.log(result);
            console.log("session = ", req.session.name);
            res.render("index_1", {concert : result, loggedname : req.session.name});
          }
      }
    )
  }else{
    var genre = req.query.genre;
    connection.query(
      `select * from concert where genre = ?`,
      [genre],
      function(err, result){
          if (err){
              console.log(err);
          }else{
            //console.log(result);
            console.log("session = ", req.session.name);
            res.render("index_1", {concert : result, loggedname : req.session.name});
          }
      }
    )
  }
});

/**
 * 로그아웃
 * 해당 아이디 로그아웃 시간을 DB에 저장하며 로그아웃 시 session 삭제
 */
app.get("/logout", function(req, res){
  
  var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간

  connection.query(
    `update login set logout = ? where id =? and login = ?`,
    [date, req.session.user, req.session.logintime],
    function(err, result){
      if(err){
        console.log("logout time DB update = ", err)
      }else{
        req.session.destroy(function (err2) {
          if (err2) {
            console.log(err2);
            res.render("error");
          } else {
            res.redirect("/");
          }
        }); 
      }
    }
  )
})

/**
 * 매크로 체크 화면
 */
app.get("/canvas", function(req,res){
  connection.query(
    `select * from mouse order by time desc`,
    function(err, result){
      if(err){
        console.log(err)
      }else{
        //console.log(result);
        res.render("test", {click : result});
      }
    }
  )
})

/**
 * 매크로 체크 화면
 * 입력 받은 아이디 값의 최근 예매 시 마우스 좌표 및 클릭한 시간 차이를 표시
 */
app.post("/canvas", function(req,res){
  var id = req.body.id;
  connection.query(
    `select * from mouse where id = ? order by time desc `,
    [id],
    function(err, result){
      if(err){
        console.log(err)
      }else{
        //console.log(result);
        res.render("test", {click : result});
      }
    }
  )
})

/**
 * 티켓 사용 시 DB update API
 */
app.post("/search_sql", function(req, res){
  var ticketId = req.body.ticketId;

  connection.query(
    `update ticket set state = 9 where ticketId = ?`,
    [ticketId],
    function(err2, result2){
      if(err2){
        console.log("scan sql2 error =", err2)
      }else{
        console.log("sql update success");
        res.json({
          "result" : "sql update complete"
        })
      }
    }
  )
})

app.post("/search_sql_test", function(req, res){
  var ticketId = req.body.ticketId;
  console.log(ticketId);

  connection.query(
    `update ticket_test set state = 9 where ticketId = ?`,
    [ticketId],
    function(err2, result2){
      if(err2){
        console.log("scan sql2 error =", err2)
        res.json({
          "result" : "sql update fail"
        })
      }else{
        console.log("sql update success");
        res.json({
          "result" : "sql update complete"
        })
      }
    }
  )
})
/**
 * QRcode Scan 시 정상 체크 유무 API
 */
app.get("/search", function(req, res){
  var ticketId = req.query.ticketId;
  var time = req.query.time;
  var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
  var time_rap = date - time;
  console.log(time_rap);
  
  connection.query(
    `select * from ticket where ticketId=?`,
    [ticketId],
    function(err, result){
      if(time_rap < 60){
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
                  console.log(result[0].state);
                  if(result[0].state == 1){
                    //console.log(httpResponse);
                    console.log(body.split(","));
                    // res.send(body.split(","));
                    res.json({
                      "result" : 0,
                      "message" : body.split(",")
                    })
                  }else if (result[0].state == 0){
                    res.json({
                      "result" : 4,
                      "message" : "Ticket not book"
                    })
                  }else{    
                    res.json({
                      "result" : 1,
                      "message" : "Ticket used"
                    });
                  }
                }
            })
        }else{
          res.json({
            "result" : 2,
            "message" : "empty"
          });
        }
      }else{
        res.json({
          "result" : 3,
          "message" : "Invalid QRcode"
        })
      }

    }
)
})

app.get("/search_test", function(req, res){
  var ticketId = req.query.ticketId;
  var time = req.query.time;
  var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간
  var time_rap = date - time;
  console.log(time_rap);
  
  connection.query(
    `select * from ticket_test where ticketId=?`,
    [ticketId],
    function(err, result){
      if(time_rap < 60){
        if(result.length > 0){
          if(err){
          console.log(err)
          }else{
            console.log(result[0].state);
            if(result[0].state == 1){
              //console.log(httpResponse);
              console.log(result[0]);
              // res.send(body.split(","));
              res.json({
                "result" : 0,
                "message" : result[0]
              })
            }else if (result[0].state == 0){
              res.json({
                "result" : 4,
                "message" : "Ticket not book"
              })
            }else{    
              res.json({
                "result" : 1,
                "message" : "Ticket used"
              });
            }
          }
        }else{
          res.json({
            "result" : 2,
            "message" : "empty"
          });
        }
      }else{
        res.json({
          "result" : 3,
          "message" : "Invalid QRcode"
        })
      }

    }
)
})

/**
 * 에러 페이지
 */
app.get("/error", function(req, res){
  res.render("error");
})

/**
 * mykeepin redirect URL 
 * mykeepin에서 리턴 받은 데이터를 암호화 해제 및 session의 값과 비교하여 본인 인증
 */
app.get("/did_result", function(req, res){
  var service_id = process.env.service_id;
  var private = process.env.private;
  var state = req.query.state;
  var code = req.query.code;
  var type = 1;
  var dataHash = "";
  console.log(req);
    let options = {
      uri: `https://auth.mykeepin.com/didauth/v1/verify/${service_id}/${state}/${code}`,
      method: 'get'
    };
    //console.log(options);
    request.get(options, function(err,httpResponse,body){
      if(err){
      console.log(err)
      }else{
        var data = JSON.parse(body);
        var did = data.data.did;
        var vp = data.data.vp;
        var signature = data.data.signature;
        var Verifier = require('mykeepin-verify-sdk');
        var info = require('./test.json');
        async function main(){

           // 사용자 DID로 검증 객체 생성
          const verifier = new Verifier(did, {
            resolver: 'https://resolver.metadium.com/1.0',
          });
          // vp, vc 추출
          await verifier.extract(vp, private);
          const getpresentation = await verifier.getPresentation();
          console.log("getpresentationResult:", getpresentation);
          // Signature를 검증한다.
          const verificationResult = await verifier.verifySignature(service_id, state, code, type, dataHash, signature);
          console.log('Signature verification:', verificationResult);
          const vpInfo = info.find((vpVo) => vpVo.vp === 'TgetIngPresentation');
          const claims = await verifier.getClaims(vpInfo, { verifyByIssuer: true });
          console.log(claims[0]);


          if(req.session.name == claims[0] && req.session.phone == claims[1]){
            if(req.session.confirm == 1){
              req.session.did = 1;
              res.render('move', {concert: req.session.concert, genre: req.session.genre});
            }else if(req.session.confirm == 2){
              req.session.wallet = 1;
              res.render('move2', {ticket: req.session.ticket});
            }
          }else if(!req.session.name){
            res.render('login');
          }else{
            res.redirect('/');
          }
          // return claims;

        }
        main();
        // res.render("ticket/search_ticket" ,{ticket : result, user : body.split(","), loggedname : req.session.name})
        // ticket.push(body);
        }
    })
})

/**
 * DID 인증 요청
 */
app.get("/did1", function(req, res){
  console.log("did1 start");
  if(req.query.ticket){
    req.session.ticket = req.query.ticket;
  }
  function guid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
    var service_id = process.env.service_id;
    var url = process.env.redirect;
    var state = guid();
    var type = "1";
    res.redirect("https://auth.mykeepin.com/didauth/v1/authorize/view?service_id="+service_id+"&redirect_uri="+url+"&state="+state+"&type="+type)
})

    /**
     * 티켓 qrcode 화면
     */
    app.get("/qrcode", function(req , res, next){
      var ticketId = req.query.ticketId;
      var name = req.query.name;
      var time = moment().format("YYYYMMDDHHmmss");
      var floor = req.query.floor;

      
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

app.get("/qrcode_test", function(req, res){
  res.render("qrcode");
})

var concertRoute = require("./routes/concert")();
app.use("/concert", concertRoute);

var ticketRoute = require("./routes/ticket")();
app.use("/ticket", ticketRoute);

var loginRoute = require("./routes/login")();
app.use("/login", loginRoute);

var managerRoute = require("./routes/manager")();
app.use("/manager", managerRoute);

server.listen(port, function () {
  console.log("웹 서버 시작", port);
});
