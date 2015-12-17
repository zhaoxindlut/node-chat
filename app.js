var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
global.scoketio = io;
var bodyParser = require('body-parser');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var path = require('path');
var session = require('express-session');


var routes = require('./routes/index');

//定义一些常量
var url = 'mongodb://localhost:27017/chat'
const COOKIE_SECRET = 'secret',
		COOKIE_KEY = 'express.sid';

//连接mongodb
MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("connected correctly to server");
    //db.close();
});

//为session分配存储
var sessionStore = new session.MemoryStore(); //????
app.use(session({
    store: sessionStore,
	secret: 'secret',
    key: 'express.sid'
}));

app.set('views', path.join(__dirname, 'views'));    //设置 views 路径
app.engine("html",require("ejs").__express); // 加载ejs模板
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true })); //when post, decode and encode body json data
app.use(bodyParser.json()); //解析post的json格式数据
app.use(express.static(path.join(__dirname, 'public')));    //设置public 静态变量路径

app.use(function(req,res,next){ //该自定义中间件还没有什么卵用，只是用来示范
    //console.log(req.session.user);
	//res.locals.user = req.session.user;
	var err = req.session.error;
	delete req.session.error;
	res.locals.message = "";
	if(err){
		res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
	}
	next();
});

io.use(function(socket, next) { //对socket.io进行配置中间件，处理socket，这里获取socket连接的sessionID
    console.log("a socket connect");
	var data = socket.handshake || socket.request;
	if (data.headers.cookie) {
        console.log("socket data exist");
		data.cookie = cookie.parse(data.headers.cookie);  //从socket连接中获得cookie信息
        console.log(data.cookie);
		data.sessionID = cookieParser.signedCookie(data.cookie[COOKIE_KEY], COOKIE_SECRET);
		data.sessionStore = sessionStore;
        console.log(data.sessionID);
		sessionStore.get(data.sessionID, function (err, session) {
			if (err || !session) {
                console.log("No session");
				return next(new Error('session not found'))
			} else {
                console.log(session);
				data.session = session;
				data.session.id = data.sessionID;
				next();
			}
		});
	} else {
		return next(new Error('Missing cookie headers'));
	}
});

//路由
app.use('/', routes);
app.use('/login', routes);
app.use('/register',routes);

//socket.io的连接和socket处理。 io.on之前会进过io.use中间件，
//通过上面的中间件，便响应这个connection事件。
//然后socket.on来开始监听客户端消息。
//其实可以设计成在上面的中间件的时候就返回未登陆错误，减少连接和socket监听开销
io.on('connection', function(socket){
    var session = socket.handshake.session;
    console.log('a user connected');
    socket.on('chat message', function(msg){
        if(session.user == null)
            socket.emit('Nologin' , '');    //给客户端发送消息，没有登陆
        else {
            console.log(session.user.username + "#" + msg);
            //给除了发送者，发送消息。
			//需要修改这里的头像，获取消息来源者的头像
            socket.broadcast.emit('chat message', {"username" : session.user.username, "msg" : msg, "userIcon" : "head2.jpg"});
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

module.export = app;
