function User(id) {
	this.id = id;
	this.hash;
	this.appHash;
	this.scores = [];
}

User.prototype.getScores = function() {
	return this.scores;
};

User.prototype.insertScore = function(score) {
	this.scores.push(score);
};

User.prototype.bestScore = function() {
	
}

module.exports = User;