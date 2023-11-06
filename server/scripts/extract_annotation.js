const mongoose = require('mongoose');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');
const articleModel = require('../model/articleModel');
var fs = require('fs');
const { url, options } = require('../config/mongodb_config');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

good_json_claims = []

async function main() {
    // Find all P3 annotation requests where the "annotation verdict" and "p2 annotation verdict" are the same
    var requests = await P3AnnotationRequestModel.find({}).populate('article').exec();

    var count = 0;
    for (let i = 0; i < requests.length; i++) {
        let request = requests[i];
        if (request.annotation && request.annotation.label == request.p2_annotation.label) {
            count++;

            good_json_claims.push(request);
        }
    }

    console.log("Total number of requests: " + requests.length);
    console.log("Number of P3 requests where the annotation verdict and p2 annotation verdict are the same: " + count);

    // Find all P5 annotation requests where the "annotation verdict" and "p4 annotation verdict" are the same
    requests = await P5AnnotationRequestModel.find({}).populate('article').exec();

    count = 0;
    for (let i = 0; i < requests.length; i++) {
        let request = requests[i];
        if (request.annotation && request.annotation.label == request.p4_annotation.label) {
            count++;

            good_json_claims.push(request);
        }
    }
    
    console.log("Total number of requests: " + requests.length);
    console.log("Number of P5 requests where the annotation verdict and p4 annotation verdict are the same: " + count);

    // Dump all annotation requests to a json file
    const json = JSON.stringify(good_json_claims, null, 2);
    fs.writeFile("data/accepted_p3_and_p5.json", json, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });
}

main();