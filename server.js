const crypto = require('crypto')
    , co = require('co')
	, express = require('express')
	, bodyParser = require('body-parser')
	, mongoose = require('mongoose')
    , bluebird = require('bluebird')
	, app = express()
	, port = 3000
	, mongoHost = process.env.MONGO || 'localhost'
	;

const App = require('./modules/App.js')
 	, User = require('./modules/User.js')
	;

const AppSchema = require('./schemas/AppSchema.js')
	, UserSchema = require('./schemas/UserSchema.js')
	;

const apps = []
	;

const props = {
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

app.post('/user/insertScore', insertScore);
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

    /*
function* getAppByHash(appHash) {
    AppSchema.findOne({ hash: appHash})
        .then(function(res) {
            yeild res;
        });
}

function* getUserById(appHash, id) {
    UserSchema.findOne({appHash, id })
        .then(res => {
            yield res;
        });
}
*/

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

function* aa() {
    const result = yield AppSchema.find();
    return result;
}

let a = co(aa);
console.log('jiji', a);

function insertScore(req, res) {
    const appHash = req.body[props.appHash];
    const userId = req.body[props.userId];
    const score   = req.body[props.score];

    co(function* () {
        const app = yield AppSchema.findOne({ hash : appHash });
        if(app === null)
            throw 'App not found.';

        let user = yield UserSchema.findOne({ id : userId, appHash });

        if(user === null)
            user = new UserSchema({ id : userId, appHash});

        user.scores.push(score);

        const result = yield user.save();
        res.send(success(result));
    });
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
    const appHash = req.body[props.appHash];
    const userId  = req.body[props.userId];

    co(function*() {
        const app = yield AppSchema.findOne({ hash: appHash });
        if(app === null)
            throw 'App not found.';

        const maxScore = yield UserSchema.mapReduce({
            map: function() {
                this.scores.forEach(i => {
                    emit('score', i);
                });
            }
            , reduce: function(key, values) {
                return values.reduce((curr, next) => {
                    return curr > next ? curr : next;
                }, 0);
            }
            , query: { appHash, id: userId }
        });

        res.send(maxScore);
    });
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