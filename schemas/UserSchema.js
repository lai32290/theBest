const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	;

var UserSchema = new Schema({
	id: String
	, appHash: String
	, scores: [Number]
});

var User = mongoose.model('User', UserSchema);

module.exports = User;