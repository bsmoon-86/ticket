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

app.get("/qrcode2", function(req, res) {
  var cofirm = {
    "ticketId" : "e3f370c6d51e6098ff4fac992a789e9f09241fc01b1db8ea7b32df75bd12d3ca",
    "name" : "김태경",
    "phone" : "01084969889",
    "email" : "moduedu@gmail.com" 
  }  //input 값 변수
    QRCode.toDataURL(JSON.stringify(cofirm), function (err, url) {
      //console.log(url)
      let data = url.replace(/.*,/,'')
      let img = new Buffer.from(data,'base64')
      res.writeHead(200,{
          'Content-Type' : 'image/png',
          'Content-Length' : img.length
      })
      res.end(img);
  })
});

app.get("/qrcode_test", function(req, res) {
  res.render("qrcode");
});
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

app.post("/sql", function(req, res){
  connection.query(
    `select * from mouse`,
    function(err, result){
      if(err){
        console.log("sql error => ", err)
      }else{
        console.log(result);
        res.json(result);
      }
    }
  )
})

app.get("/sql", function(req, res){
  var id = req.query.id;
  connection.query(
    `select * from mouse where id =?`,
    [id],
    function(err, result){
      if(err){
        console.log("sql error => ", err)
      }else{
        console.log(result);
        res.json(result);
      }
    }
  )
})

app.post("/sql_update", function(req, res){
  var no = req.body.no;
  var probability = req.body.probability;
  connection.query(
    `update mouse set probability = ? where no =?`,
    [probability, no],
    function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send("1");
      }
    }
  )
})

app.get("/time", function(req, res){
  var id = req.query.id;
  connection.query(
    `select * from login where id =?`,
    [id],
    function(err, result){
      if(err){
        console.log("sql error => ", err)
      }else{
        console.log(result);
        res.json(result);
      }
    }
  )
})

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



app.get("/search", function(req, res){
  var ticketId = req.query.ticketId;
  // var name = req.query.name;
  // var phone = req.query.phone;
  // var email = req.query.email;
  
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
                  console.log(result[0].state);
                  if(result[0].state == 1){
                    connection.query(
                      `update ticket set state = 9 where ticketId = ?`,
                      [ticketId],
                      function(err2, result2){
                        if(err2){
                          console.log("scan sql2 error =", err2)
                        }else{
                          //console.log(httpResponse);
                          console.log(body.split(","));
                          res.send(body.split(","));
                        }
                      }
                    )
                  }else{    
                    res.json({
                      "result" : "Ticket used"
                    });
                  }
                }
            })
        }else{
          res.json({
            "result" : "empty"
          });
        }

    }
)
})


app.get("/chart", function(req, res){
  res.render("concert/seat_selection_soccer1");
})

app.get("/error", function(req, res){
  res.render("error");
})

app.get("/ticket1", function(req, res){
  console.log("android connecting")
  // var input = req.body;
  // console.log(input)
  // res.json(input);
})

app.get("/pay", function(req, res){
  // console.log(req);
  console.log(req.query.concertId);
  res.redirect("/");
})

app.get("/did_result", function(req, res){
  var service_id = "10523b7c-7cc2-11eb-a5b1-02c81e87218a";
  var private = {
                    "p": "86Rc76JyFXR89TS0lqRHsrxW4Q_0U5pUQ-p65wS7HPPuK_jJkL-vcZDlkRKiV7glDZT6sFzasDts52eDzWm9YXghNntoM2wkpKBoDW3roZTRzEc73j2RQ7tA2c62Z0iPu4Ce31ogakZA0F27pqbw7aePUE5XMDLUIW1kbgClm90",
                    "kty": "RSA",
                    "q": "tfPBeljGq8cieCdV8v6cPQFX-4lrVuKnd-CfgbF5Yw1IYNPrh2alkhEW5FezEV5Eg0HYpL2QwAumWDcJO7NPAOQkWE083eZVKfpTI0LAxBM18O6mEbYgCXtTKz3waIV2qeIigtSKZhsEonsuGKqN01wjL9OsKH2JhqOnlsMfgQE",
                    "d": "jjV3o75TR7o50WOfhPnFiIZIvhyeJmFqLcGLbmr4Ts2whDRNta9Do1cYpbjOdGCFwfMh3lX5eVmkpVEdc7eyyAT0mQYnNCnsWDWCt_RqbG-mZNUPoxW64A2Fd-Do121O01HbRmXZCsEg14VJQej8Ogly44C_9lApyFxp_mgLg-yiLSBkIzpx9bbIpTdgd1erY2vc0nMfYYfqOKzk-3mZ3oxY2Wv652Kr90_aBk7GNfDCf8dSAyY0JhGSB2spFwek9ge8ztUNjfr4f-FHZmkLiRl4unIM-zWUbYzCl7njVNfd1Oyj9Hd5obgzF82YitIJmbWsUy5bl4LP2hbfPTaQAQ",
                    "e": "AQAB",
                    "qi": "6m5hZNb2WYjf--NyfPEq1CbSgrxyShmRjpTYkKsF87xXsl0TQv7uUfWLIZ5PHoAVAc_EK956wCvb9t4zHN2SiAY37bLCjjvbh_xO_x95C9s1CrtsGmXBllT5T8OpTVPaPkwsSqflMhNxPbYPIGYWUpu4bNG_fq19-PmzA505JA0",
                    "dp": "OSTEs2OrVELlB_HbpTVUp6Qq0FCYon8g4mj9eG-Qn0LLCr8oL2317THp1fPD5cUH076saW7tz8WwTjnmHOh_BXxSdd_N2bm0gnQo03WDfXtVFY9jiEVya6tgk3U7LNBE_do16PbPgX2GuBgz6etfuK3DHDezlVdmj4yDsJUwQnU",
                    "dq": "cSTHrj3gJNdqrs6_GqCLJUBdprPYRKoiu1-5sFtdAWQ0GsoNDyCcWs03r_x9BJLbBcf_YMnkZheYdAidPDuPKB22IBa_f7kIQldANY__8K2FgHHWYPMgzuSaXixg_43msVNGZJaoDUBFzIfOrVX5ZXJJCyeUSYVu7IN95jklsQE",
                    "n": "rSsy3QA0Y6-3TGD2eHswUaQvSE6F7AUthrSapXIiGo0ibYAwmlPf5VaILPw7zjjcadQ4LEEu-RH4bCxh-IcxwK3PF7NwXKA0XumU8gyu0YdFo4xXQXUPRIQRwh5U2_lol00Rtvtpd1MktHmyStxHU0R2Ge5l5p6Q-8leD5LCd_MUSJTqlC_k6Hsi1Uvh2wTTutNWIbKNuTLQU12s2NOMRwgL8T3z4ebUTfb8Q__QMeaNXCINmELe-XSqACSVSpAfc94k0awSOxhKIyPLOI_d5PBADfWbnSw6tyUnVlfUJ-H-BOj2bBALWTGbo9BPilH3xWujDOM0fZiKRosGqvL43Q"
                }		
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


          if(req.session.name == claims[0]){
            if(req.session.confirm == 1){
              req.session.did = 1;
              res.render('move', {concert: req.session.concert, genre: req.session.genre});
            }else if(req.session.confirm == 2){
              req.session.wallet = 1;
              res.render('move2', {ticket: req.session.ticket});
            }
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
app.get("/did1", function(req, res){
  res.render('confirm');
})
app.get("/did2", function(req, res){
  req.session.ticket = req.query.ticket;
  res.render('confirm');
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
