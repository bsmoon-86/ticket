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
app.post("/qrcode", function(req, res) {
  var ticketId = req.body.ticketId;
  var name = req.body.name;
  var cofirm ={
    ticketId : ticketId,
    name : name,
    phone : req.session.phone,
    email : req.session.email,
  }   //input 값 변수
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



app.post("/search", function(req, res){
  var ticketId = req.body.ticketId;
  var name = req.body.name;
  console.log(ticketId);
  console.log(name);
  console.log(req.body);
  res.send(name);
})


app.get("/chart", function(req, res){
  res.render("concert/seat_selection_soccer1");
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
