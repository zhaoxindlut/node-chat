var mongo = require('mongodb');
var Step = require('step');

var db = new mongo.Db('test', new mongo.Server('localhost', 27017, {auto_reconnect: true}));

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'test' database");
		db.collection('user', {safe:true}, function(err, collection) {
			if (err) {
				console.log("The 'invitation' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
	}
});

exports.register=function(req, res){
    var collectuser = null;
	Step(
		function getCollection(){
			db.collection('user', this);
		},
        function findData(err, collection){
            if (err) throw err;
            collectuser = collection;
            var doc = collection.findOne({'username' : req.body.uname}, this);
        },
		function insertData(err,doc, collection){
			if (err) throw err;
            if(doc)
                return null,null;
            var invitation={
                    'username' : req.body.uname,
                    'password' : req.body.upwd
            };
            collectuser.insert(invitation, {safe:true}, this)
		},
		function generateResponse(err, result){
			if (err) throw err;
			//res.send(invitation);
            if(result){
                console.log('yes');
                res.json({success : 1, "err" : 0});
            }
            else {
                console.log('no');
                res.json({success : 1, "err" : 1});
            }
		});
}

exports.login=function(req, res){
    var collectuser = null;
	Step(
		function getCollection(){
			db.collection('user', this);
		},
        function findData(err, collection){
            if (err) throw err;
            collectuser = collection;
            var doc = collection.findOne({'username' : req.body.uname}, this);
        },
		function (err,doc, collection){
			if (err) throw err;
            if(!doc || doc.password != req.body.upwd){
                req.session.user = null;
                res.json({success : 1, "err" : 1})
            }
            else {
                req.session.user = doc;
                res.json({success : 1, "err" : 0})
				global.socketio.emit('sysmsg', {msgType: 1, username: doc.username});
            }
		});
}

//socket-normal db control
exports.getUserInfo=function(userId, callback){
	Step(
		function getCollection(){
			db.collection('user', this);
		},
		function findData(err, collection){
			if(err) throw err;
			collection.findOne({'username' : userId}, this);
		},
		function (err, doc){
			if (err) throw err;
			if(doc) {
				doc["headicon"] = 'head2.jpg';
				callback(doc);
			}
			else {
				console.log("getUserInfo： Not find the user info, ID: " + userId);
				callback(doc);
			}
		}
	)
}

exports.getUserInfoList=function(userIdList, callback){
	var infoList = [];
	for(var i = 0; i < userIdList.length; i++){
		infoList.push({"user_id": userIdList[i], "nickname": userIdList[i], "headicon" : "head2.jpg"});
	}
	callback(infoList);
}
exports.sharedDB=db;
//啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦
