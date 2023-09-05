const mongoose = require('mongoose');
const trainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const articleModel = require('../model/articleModel');
const { url, options } = require('../config/mongodb_config');
const fs = require('fs');
const { json } = require('express');
const { exit } = require('process');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

var data_url = "../data/p1_train.json"
var phase = 1;

var jsonData = JSON.parse(fs.readFileSync(data_url, 'utf8'));

jsonData.map( async (annotationSet) => {
  article_json = annotationSet.article
  article_url = article_json.fact_checking_article

  // Check if article already exists
  let article = await articleModel.findOne({fact_checking_article: article_url}).exec();

  let article_id = null;
  if (article) {
    article_id = article._id;
  }
  else {
    let article = await articleModel.create(article_json);
    article_id = article._id;
  }

  annotationSet.article = article_id;
  trainingP1AnnotationRequestModel.create(annotationSet).then(function(annotationRequest){
    console.log("Successfully inserted annotation request");
  } ).catch(function(error){
    console.log(error)      // Failure
  } );
});


