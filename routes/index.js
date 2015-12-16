var express = require('express');

var db = require('../db.js');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res,next) {
    res.render('index', { title: '欢迎到此' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
});

router.route('/home')
.get(function(req, res) {
    res.locals.username = "";
    if(req.session.user)
        res.locals.username = req.session.user.username;
    else {
        req.session.user = null;
    }
    res.render('home');    // 到达此路径则渲染index文件，并传出title值供 index.html使用
})

router.route('/register')
.post(db.register)

router.route('/login')
.post(db.login)

router.route('/logout')
.get(function(req, res) {
    res.locals.username = "";
    req.session.user = null;
    res.render('home');
})
/*
router.get('/register', function(req, res,next) {
    res.render('register', { title: '欢迎到此' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
});

router.post('/register', function(req,res,next){ 					   // 从此路径检测到post方式则进行post数据的处理操作
	//var uname = req.body.uname;				//获取post上来的 data数据中 uname的值
    //var upasswd = req.body.upwd;
    console.log(req.body);
    //console.log(upasswd);
});
*/
router.get('/login', function(req, res,next) {
    res.render('login', { title: '欢迎到此' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
});

module.exports = router;
