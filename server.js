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

const appNotFoundMsg = 'App not found.';

mongoose.Promise = bluebird;

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', index);
app.get('/status', getStatus);
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
    const appHash = req.body[props.appHash];
    const userId = req.body[props.userId];
    const score   = req.body[props.score];

    co(function* () {
        const app = yield AppSchema.findOne({ hash : appHash });
        if(app === null) {
            res.send(error(appNotFoundMsg));
            return;
        }

        let user = yield UserSchema.findOne({ id : userId, appHash });

        if(user === null)
            user = new UserSchema({ id : userId, appHash});

        user.scores.push(score);

        const result = yield user.save();
        res.send(success(result));
    });
}

function tops(req, res) {
    const appHash  = req.body[props.appHash];
    const topLimit = req.body[props.topLimit] || 10;

    co(function* () {
        const app = yield AppSchema.findOne({ hash: appHash});

        if(app === null) {
            res.send(error(appNotFoundMsg));
            return;
        }

        const bestScores = yield bestScoresAggregade({ appHash }).limit(topLimit).exec();

        res.send(success(bestScores));
    });
}

function userBestScore(req, res) {
    const appHash = req.body[props.appHash];
    const userId  = req.body[props.userId];

    co(function*() {
        const app = yield AppSchema.findOne({ hash: appHash });
        if(app === null) {
            res.send(error(appNotFoundMsg));
            return;
        }

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
    const appHash = req.body[props.appHash];
    const userId  = req.body[props.userId];

    co(function*() {
        const app = yield AppSchema.findOne({ hash : appHash });

        if(app === null) {
            res.send(error(appNotFoundMsg));
            return;
        }

        const scores = yield UserSchema.findOne({ appHash, id: userId }).select('scores');
        res.send(success(scores));
    });
}
//////////////////
function bestScoresAggregade(match) {
	return UserSchema.aggregate(
		{
			$match: match
		}, {
			$project: {
				id: "$id",
				bestScore: {
					$max : "$scores"
				}
			}
		});
}

function success(data) {
    return {
        status: 'success'
        , statusCode: 1
        , data: data
    };
}

function error(data) {
    return {
        status: 'error'
        , statusCode: 0
        , data: data
    };
}

//////////////////