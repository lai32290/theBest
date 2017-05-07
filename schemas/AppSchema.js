const mongoose = require('mongoose')
	, crypto = require('crypto')
	, Schema = mongoose.Schema
	;

var AppSchema = new Schema({
	hash: { type: String }
	, name: { type: String }
});

var App = mongoose.model('App', AppSchema);

module.exports = App;