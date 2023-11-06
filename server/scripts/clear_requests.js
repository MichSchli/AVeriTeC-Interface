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

// Dump all annotation requests to a json file
async function dumpAnnotationRequestsToJson(RequestClass, filename) {
    const requests = await RequestClass.find({}).populate('article').exec();
    const json = JSON.stringify(requests, null, 2);

    // output the json to a file
    fs.writeFile(filename, json, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });

    console.log("Successfully dumped " + requests.length + " annotation requests to " + filename);
    console.log("Now deleting all " + RequestClass.modelName + "s from the database");

    await RequestClass.deleteMany({}).then(function () {
        console.log("Data deleted"); // Success
    }
    ).catch(function (error) {
        console.log(error)      // Failure
    }
    );
}

// Make the directory if it doesn't exist
if (!fs.existsSync("data/request_backup")) {
    fs.mkdirSync("data/request_backup");
}

dumpAnnotationRequestsToJson(P1AnnotationRequestModel, "data/request_backup/p1_annotation_requests.json");
dumpAnnotationRequestsToJson(P2AnnotationRequestModel, "data/request_backup/p2_annotation_requests.json");
dumpAnnotationRequestsToJson(P3AnnotationRequestModel, "data/request_backup/p3_annotation_requests.json");
dumpAnnotationRequestsToJson(P4AnnotationRequestModel, "data/request_backup/p4_annotation_requests.json");
dumpAnnotationRequestsToJson(P5AnnotationRequestModel, "data/request_backup/p5_annotation_requests.json");