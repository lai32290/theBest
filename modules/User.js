function User(id) {
	this.id = id;
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
	return Math.max.apply(Math, this.scores);
}

module.exports = User;