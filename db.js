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
            }
		});
}
exports.sharedDB=db;
