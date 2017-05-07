const crypto = require('crypto')
	, express = require('express')
	, bodyParser = require('body-parser')
	, mongoose = require('mongoose')
    , bluebird = require('bluebird')
	, app = express()
	, port = 3000
	, mongoHost = process.env.MONGO || 'localhost'
	;

var App = require('./modules/App.js')
 	, User = require('./modules/User.js')
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
	, topLimit: 'top_limit'
};

mongoose.Promise = bluebird;

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', index);
app.get('/status', getStatus);
app.post('/app/bestScores', bestScores);
app.post('/app/tops', tops);
app.post('/app/new', newApp);

app.post('/user/insert', insertScore);
app.post('/user/scores', userScores);
app.post('/user/bestScore', userBestScore);

app.listen(port, function() {
	console.log('Service is running on port ' + port);
	console.log('Host MongoDB : '+ mongoHost);
	mongoose.connect('mongodb://'+ mongoHost +'/the_best', function() {
		console.log('MongoDB is connected');
	});
});

function success(data) {
    return {
        status: 'success',
        statusCode: 1,
        data: data
    };
}

function index(req, res) {
	res.sendFile(__dirname + '/index.html');
}

function getStatus(req, res) {
    res.send(success({message: 'The Best is On!'}));
}

function newApp(req, res) {
	var appName = req.body.name;
	var app = new AppSchema({
        hash: crypto.randomBytes(20).toString('hex')
        , name: appName
	});
    
    app.save()
        .then(r => {
            res.send(success({ hash : r.hash}));
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

				if(resApp === undefined) {
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

				if(resUser === undefined) {
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
	try {
		var appHash = req.body[props.appHash];

		AppSchema.findOne({ hash: appHash})
			.then(function(resApp, err) {
				if(err) {
					throw err;
				}

				if(resApp === undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				var app = resApp;

				return bestScoresAggregade({ appHash: app.hash }).sort('-bestScore').exec();
			})
			.then(function(result, err) {
				if(err) throw err;

				res.send(result);
			});
	} catch (err) {
		res.send(err);
	}
}

function tops(req, res) {
	try {
		var appHash  = req.body[props.appHash];
		var topLimit = req.body[props.topLimit];

		AppSchema.findOne({ hash: appHash})
			.then(function(resApp, err) {
				if(err) {
					throw err;
				}

				if(resApp === undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				var app = resApp;

				return bestScoresAggregade({ appHash: app.hash }).limit(topLimit).exec();
			})
			.then(function(result, err) {
				if(err) throw err;

				res.send(result);
			});
	} catch (err) {
		res.send(err);
	}
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

				if(resApp === undefined) {
					var erro = 'App not found';
					console.log(error);
					throw error;
				}

				app = resApp;

				return bestScoresAggregade({ appHash: resApp.hash, id: userId }).exec();

				// return UserSchema.findOne({ 
				// 			appHash: resApp.hash 
				// 			, id: userId
				// 		})
				// 		.select('scores -_id');
			})
			.then(function(result, err) {
				if(err)	throw err;

				if(result === undefined) {
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

				if(resApp === undefined) {
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

				if(result === undefined) {
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
function bestScore(scores) {
	return Math.max.apply(Math, scores);
}

function bestScoresAggregade(match) {
	return UserSchema.aggregate(
		{
			$match: match
		}, {
			$project: {
				_id: {},
				id: "$id",
				bestScore: {
					$max : "$scores"
				}
			}
		});
}
//////////////////