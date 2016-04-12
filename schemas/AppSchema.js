const mongoose = require('mongoose')
	, crypto = require('crypto')
	, Schema = mongoose.Schema
	;

var AppSchema = new Schema({
	hash: { type: String, default: crypto.randomBytes(20).toString('hex') }
	, name: String
	, users: []
});

var App = mongoose.model('App', AppSchema);

module.exports = App;