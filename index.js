var http = require("http");
var express = require("express");
const QRCode = require('qrcode')
const bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");


var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306, // db 포트
  user: "root", // user 이름
  password: "1234", // 비밀번호
  database: "test", // database 이름
});

var time_diff = 0;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  
  connection.query(
    `select * from concert`,
    function(err, result){
        if (err){
            console.log(err);
        }else{
          console.log(result);
          res.render("index_1", {concert : result});
        }
    }
  )
});


// index page에서 mouse click 시 좌표 sql DB에 저장
app.post("/click", function (req, res) {
  console.log("click");
  console.log("x=", req.body.x, "y=", req.body.y);    //req.body.x = x축 마우스 좌표 // req.body.y = y축 마우스 좌표
  var date = moment().format("YYYYMMDDHHmmss");       //moment를 이용한 현재 시간 
  if(time_diff == 0 ){
    var time2 = 0;
  }else{
    var time2 = date - time_diff;                     //이전 시간의 기록이 존재하면 그 시간과 현재 시간의 차이 값
  }
  console.log(date);
    connection.query(
      "insert into mouse(time, time2, x_position, y_position) values (?,?,?,?)",
      [date, time2, req.body.x, req.body.y],
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("insert success");
        }
      }
    );
    time_diff = date;
});



//QR code 만들기
app.get("/qrcode", function(req, res) {
  var concert = req.query.concert;
  var cofirm = "http://kairos-link.iptime.org:3333/confirm?concert=" + concert;     //input 값 변수

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

app.get("/confirm", function(req, res){
  var concert = req.query.concert;
  console.log(concert);
  res.render("confirm")
})

app.post("/confirm2", function(req, res){
  var name = req.body.name;
  
  var mykeepin = require('./Library/mykeepin-verify-sdk/example/example');
  const person = function test(){
      return mykeepin();
  }
  person().then(function(result){
      console.log(result[1]);
      if (name == result[1]){
        console.log("equal name")
        res.render("ticket/myticket")
      }else{
        console.log("not match")
        res.redirect("/")
      }
      // res.render("ticket/seat" ,{did : result, date : date, time : time ,concertId : concertId});
  })
})

var concertRoute = require("./routes/concert")();
app.use("/concert", concertRoute);

var ticketRoute = require("./routes/ticket")();
app.use("/ticket", ticketRoute);

var hallRoute = require("./routes/hall")();
app.use("/hall", hallRoute);

var managerRoute = require("./routes/manager")();
app.use("/manager", managerRoute);

server.listen(port, function () {
  console.log("웹 서버 시작", port);
});
