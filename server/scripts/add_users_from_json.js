const mongoose = require('mongoose');
const UserModel = require('../model/userModel');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const { url, options } = require('../config/mongodb_config');
const fs = require('fs');
const { json } = require('express');
const { exit } = require('process');
let md5 = require('md5');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

var data_url = "../data/admin_users.json"
var phase = 1;

var jsonData = JSON.parse(fs.readFileSync(data_url, 'utf8'));

jsonData.map( (user) => {
  // If the user has no information on is_active, just set it to true:
  if (user.is_active == null) {
    user.is_active = true;
  }

  // Hash the password:
  user.passwordHash = md5(user.password);

  // Create the user model
  var newUser = UserModel.create(user).then( async function(user){
    console.log("Successfully inserted user");

    // Get the template training requests (requests with no user) from the db:
    template_requests = await TrainingP1AnnotationRequestModel.find({user: null}).exec();

    // Create copies of the template requests for the new user:
    template_requests.map( async (template_request) => {
      template_request._id = null;
      template_request.isNew = true;
      template_request.assigned_user_id = user._id;
      TrainingP1AnnotationRequestModel.create(template_request).then(function(annotationRequest){
        console.log("Successfully inserted training annotation request for user id " + user._id + " and article id " + annotationRequest.article_id);
      } ).catch(function(error){
        console.log(error)      // Failure
      } );
    });

  } ).catch(function(error){
    console.log(error)      // Failure
  } );
});


