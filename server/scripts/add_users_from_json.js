const mongoose = require('mongoose');
const UserModel = require('../model/userModel');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const { url, options } = require('../config/mongodb_config');
const fs = require('fs');
const { json } = require('express');
const { exit } = require('process');
const bcrypt = require('bcrypt');
const { createTrainingRequests, resetTrainingRequests } = require('../utils/trainingRequestUtils');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

var data_url = "data/admin_users.json"
var phase = 1;

var jsonData = JSON.parse(fs.readFileSync(data_url, 'utf8'));

jsonData.map( async (user) => {
  // If the user has no information on is_active, just set it to true:
  if (user.is_active == null) {
    user.is_active = true;
  }

  // Hash the password:
  const saltRounds = 10;
  user.passwordHash = await bcrypt.hash(user.password, saltRounds);

  // Create the user model
  var newUser = UserModel.create(user).then( async function(user){
    console.log("Successfully inserted user");

    // Create training requests for the new user
    await createTrainingRequests(user, 1);
    await createTrainingRequests(user, 2);

  } ).catch(function(error){
    console.log(error)      // Failure
  } );
});


