const mongoose = require('mongoose');
const trainingP3AnnotationRequestModel = require('../model/annotationRequests/trainingP3AnnotationRequestModel');
const { createTrainingRequests, resetTrainingRequests } = require('../utils/trainingRequestUtils');
const articleModel = require('../model/articleModel');
const userModel = require('../model/userModel');
const { url, options } = require('../config/mongodb_config');
const fs = require('fs');
const { json } = require('express');
const { exit } = require('process');

async function main() {
  console.log("Connecting to MongoDB at " + url);
  mongoose.connect(url, options);
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });

  var data_url = "data/p3_train.json"

  // Delete the existing training requests before doing anything else:
  await trainingP3AnnotationRequestModel.deleteMany({}).then(function () {
    console.log("Data deleted"); // Success
  }).catch(function (error) {
    console.log(error)      // Failure
  });

  var jsonData = JSON.parse(fs.readFileSync(data_url, 'utf8'));

  // Create all training requests, waiting for each one to finish before starting the next one
  for (let i = 0; i < jsonData.length; i++) {
    let annotationSet = jsonData[i];

    if (annotationSet.article != null) {
      let article_json = annotationSet.article
      let article_url = article_json.fact_checking_article

      // Check if article already exists
      let article = await articleModel.findOne({ fact_checking_article: article_url }).exec();

      let article_id = null;
      if (article) {
        article_id = article._id;
      }
      else {
        let article = await articleModel.create(article_json);
        article_id = article._id;
      }

      annotationSet.article = article_id;
    }

    await trainingP3AnnotationRequestModel.create(annotationSet).then(function (annotationRequest) {
      console.log("Successfully inserted annotation request for P3 training claim \"" + annotationSet.p1_annotation.claim + "\"");
    }).catch(function (error) {
      console.log(error)      // Failure
    });
  }

  // For all users, reset training requests
  const users = await userModel.find({}).exec();

  await Promise.all(users.map(async (user) => {
    await resetTrainingRequests(user, 3);
  }
  ));
  console.log("All training requests updated.");
}

main()