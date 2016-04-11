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
app.post('/bestScores', bestScores);
app.post('/newApp', newApp);
app.post('/insert', insertScore);

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

	var app  = findAppByHash(appHash);
	if(app === undefined) {
		appNotFound(req, res);
		return;
	}

	var user = app.getUserById(user_id);

	if(user === undefined) {
		user = new User(user_id);
	}

	user.insertScore(score);

	res.send('Success');
}

function bestScores = function(req, res) {
	var appHash = req.body[props.appHash];

	var app = findAppByHash(appHash);
	if(app === undefined) {
		appNotFound(req, res);
		return;
	}

	return app.bestScores();
}

//////////////////
function findAppByHash(hash) {
	return apps.find(function(item) {
		return item.hash == hash;
	});
}

function appNotFound(req, res) {
	res.find('App not found');
}
//////////////////