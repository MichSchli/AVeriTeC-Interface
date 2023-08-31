const mongoose = require('mongoose');
const { url, options } = require('./config/mongodb_config');
const trainingAnnotationSetModel = require('./model/trainingAnnotationSetModel');
const fs = require('fs');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

var data_url = "training_claims.json"
var phase = 1;

var jsonData = JSON.parse(fs.readFileSync(data_url, 'utf8'));

if (phase == 1) {
  dataAsAnnotationSets = jsonData.map((claim) => {
    var annotationSet = new trainingAnnotationSetModel({
      fact_checking_article: {
        claim: claim.claim,
        fact_checking_article: claim.fact_checking_article,
        fact_checking_date: claim.fact_checking_date
      },
      p1_annotation: claim,
      phase: phase
    });
    return annotationSet;
  });
}


trainingAnnotationSetModel.insertMany(dataAsAnnotationSets, (err, docs) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully inserted " + docs.length + " annotations");
  }
  mongoose.connection.close();
}
);

