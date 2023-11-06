const mongoose = require('mongoose');
var fs = require('fs');
const { url, options } = require('../config/mongodb_config');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Drop the database
db.dropDatabase().then(function () {
    console.log("Database dropped"); // Success
}).catch(function (error) {
    console.log(error)      // Failure
});