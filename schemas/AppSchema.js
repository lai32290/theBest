const mongoose = require('mongoose')
	, crypto = require('crypto')
	;

var Schema = mongoose.Schema;

var AppSchema = new Schema({
	hash: { type: String, default: crypto.randomBytes(20).toString('hex') },
	name: String,
	users: []
});

App = mongoose.model('App', AppSchema);
module.exports = App;