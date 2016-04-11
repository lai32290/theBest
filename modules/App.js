const crypto = require('crypto');
var User = require('./User.js');


function App() {
	this.hash = crypto.randomBytes(20).toString('hex');
	this.name;
	this.users = [];
}

App.prototype.newUser = function(id) {
	var user = new User(id);
	user.appHash = this.hash;
	this.users.push(user);

	return user;
};

App.prototype.getUsers = function() {
	return this.users;
};

App.prototype.getUserById = function(id) {
	return this.users.find(function(item) {
		return item.id == id;
	});
};

App.prototype.bestScores = function() {
	
}


module.exports = App;