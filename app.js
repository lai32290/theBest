const crypto = require('crypto')
	, express = require('express')
	, bodyParser = require('body-parser')
	, app = express()
	, port = 3000
	;

var App = require('./modules/App.js')
	User = require('./modules/User.js')
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

app.listen(port, function() {
	console.log('Service is running on port ' + port);
});

function index(req, res) {
	res.sendFile(__dirname + '/index.html');
}

function newApp(req, res) {
	var appName = req.body.name;
	var app = new App(appName);
	apps.push(app);

	res.send('Your hash: ' + app.hash);
}

function insertScore(req, res) {
	var appHash = req.body[props.appHash];
	var user_id = req.body[props.userId];
	var score   = req.body[props.score];

	var app = findAppByHash(appHash, function() {
		appNotFound(req, res);
	});

	var user = app.getUserById(user_id);
	if(user === undefined) {
		user = app.newUser(user_id);
	}

	user.insertScore(score);

	res.send('Success');
}

function bestScores(req, res) {
	var appHash = req.body[props.appHash];

	var app = findAppByHash(appHash, function() {
		appNotFound(req, res);
	});

	return app.bestScores();
}

function userBestScore(req, res) {
	var appHash = req.body[props.appHash];
	var user_id = req.body[props.userId];

	var app = findAppByHash(appHash, function() {
		appNotFound(req, res);
	});

	var user = app.getUserById(user_id);
	if(user === undefined) {
		userNotFound(req, res);
	}
}

function userScores(req, res) {
	var appHash = req.body[props.appHash];
	var user_id = req.body[props.userId];

	var app = findAppByHash(appHash, function() {
		appNotFound(req, res);
	});

	var user = app.getUserById(user_id);
	if(user === undefined) {
		userNotFound(req, res);
	}

	res.send(user.getScores());
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

function appNotFound(req, res) {
	res.send('App not found');
}

function userNotFound(req, res) {
	res.send('User not found');
}
//////////////////