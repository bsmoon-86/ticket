var http = require("http");
var express = require("express");
const QRCode = require('qrcode')
const bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");
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

var time_diff = 0;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
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
            console.log(result);
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
            console.log(result);
            console.log("session = ", req.session.name);
            res.render("index_1", {concert : result, loggedname : req.session.name});
          }
      }
    )

  }
});



//QR code 만들기
app.get("/qrcode", function(req, res) {
  var concertId = req.query.concertId;
  var cofirm = "http://kairos-link.iptime.org:3333/ticket?concertId=" + concertId;     //input 값 변수

    QRCode.toDataURL(cofirm, function (err, url) {
      let data = url.replace(/.*,/,'')
      let img = new Buffer.from(data,'base64')
      res.writeHead(200,{
          'Content-Type' : 'image/png',
          'Content-Length' : img.length
      })
      res.end(img)

  })
});

app.get("/logout", function(req, res){
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
        res.render("error");
      } else {
        res.redirect("/");
      }
    });
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
