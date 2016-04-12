const crypto = require('crypto')
	, express = require('express')
	, bodyParser = require('body-parser')
	, mongoose = require('mongoose')
	, app = express()
	, port = 3000
	;

var App = require('./modules/App.js')
	User = require('./modules/User.js')
	;

var AppSchema = require('./schemas/AppSchema.js')
	, UserSchema = require('./schemas/UserSchema.js')
	;

var apps = []
	;

var props = {
	appHash: 'app_hash'
	, userId: 'user_id'
	, score: 'score'
};

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', index);
app.post('/app/bestScores', bestScores);
app.post('/app/new', newApp);

app.post('/user/insert', insertScore);
app.post('/user/scores', userScores);
app.post('/user/bestScore', userBestScore);

app.listen(port, function() {
	console.log('Service is running on port ' + port);
	mongoose.connect('mongodb://localhost/the_best');
});

function index(req, res) {
	res.sendFile(__dirname + '/index.html');
}

function newApp(req, res) {
	var appName = req.body.name;
	var app = new AppSchema({
		name: appName
	});

	app.save(function(err) {
		if(err) throw err;

		res.send('Your hash: ' + app.hash);
	});
}

function insertScore(req, res) {
	try {
		var appHash = req.body[props.appHash];
		var userId = req.body[props.userId];
		var score   = req.body[props.score];

		var app, user;

		AppSchema.findOne({ hash: appHash})
			.then(function(resApp, err) {
				if(err) {
					throw err;
				}

				if(resApp == undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				app = resApp;

				return UserSchema.findOne({ 
					appHash: resApp.hash 
					, id: userId
				});
			})
			.then(function(resUser, err) {
				if(err) throw err;

				if(resUser == undefined) {
					resUser = new UserSchema({
						appHash: app.hash
						, id: userId
					});
				}

				user = resUser;

				user.scores.push(score);
				user.save(function(err) {
					if(err)	throw err;

					res.send('Success');
				});
			});
	} catch(err) {
		res.send(err);
	}
}

function bestScores(req, res) {
	var appHash = req.body[props.appHash];

	var app = findAppByHash(appHash, function() {
		appNotFound(req, res);
	});

	return app.bestScores();
}

function userBestScore(req, res) {
	try {
		var appHash = req.body[props.appHash];
		var userId  = req.body[props.userId];

		var app;

		AppSchema.findOne({ hash: appHash})
			.then(function(resApp, err) {
				if(err) {
					throw err;
				}

				if(resApp == undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				app = resApp;

				return UserSchema.findOne({ 
							appHash: resApp.hash 
							, id: userId
						})
						.select('scores -_id');
			})
			.then(function(result, err) {
				if(err)	throw err;

				if(result == undefined) {
					var error = 'User not found';
					console.log(error);
					throw error;
				}

				var bestScore = Math.max.apply(Math, result.scores);

				res.send({score: bestScore});
			});
	} catch (err) {
		res.send(err);
	}
}

function userScores(req, res) {
	try {
		var appHash = req.body[props.appHash];
		var userId  = req.body[props.userId];

		var app;

		AppSchema.findOne({ hash: appHash})
			.then(function(resApp, err) {
				if(err) {
					throw err;
				}

				if(resApp == undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				app = resApp;

				return UserSchema.findOne({ 
							appHash: resApp.hash 
							, id: userId
						})
						.select('scores -_id');
			})
			.then(function(result, err) {
				if(err)	throw err;

				if(result == undefined) {
					var error = 'User not found';
					console.log(error);
					throw error;
				}

				res.send(result);
			});
	} catch (err) {
		res.send(err);
	}
}

//////////////////
function findAppByHash(hash, appNotExist) {
	var _app = apps.find(function(item) {
		return item.hash == hash;
	});

	if(_app === undefined) {
		appNotExist();
		return undefined;
	}

	return _app;
}

function getApp(hash, req, res, successCallback) {
	AppSchema.findOne({ hash: appHash})
		.then(function(resApp, err) {
			if(err) {
				throw err;
			}

			if(resApp == undefined) {
				var erro = 'App not found';
				console.log(error);
				throw error;
			}

		});
}

function appNotFound(req, res) {
	res.send('App not found');
}

function userNotFound(req, res) {
	res.send('User not found');
}
//////////////////