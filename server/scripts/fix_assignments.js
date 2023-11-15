const mongoose = require('mongoose');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');
const UserModel = require('../model/userModel');
var fs = require('fs');
const { url, options } = require('../config/mongodb_config');

console.log("Connecting to MongoDB at " + url);
mongoose.connect(url, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// For all annotation requests, find the assigned user.
// If that user does not have that request in their assignments, add it.
// If that user does have that request in their assignments, do nothing.
async function main() {
    for (let phase = 1; phase <= 5; phase++) {
        var AnnotationRequestModel;
        if (phase == 1) {
            AnnotationRequestModel = P1AnnotationRequestModel;
        } else if (phase == 2) {
            AnnotationRequestModel = P2AnnotationRequestModel;
        } else if (phase == 3) {
            AnnotationRequestModel = P3AnnotationRequestModel;
        } else if (phase == 4) {
            AnnotationRequestModel = P4AnnotationRequestModel;
        } else if (phase == 5) {
            AnnotationRequestModel = P5AnnotationRequestModel;
        }

        var requests = await AnnotationRequestModel.find({}).exec();

        for (let i = 0; i < requests.length; i++) {
            let request = requests[i];
            let user_id = request.assigned_user;

            if (user_id) {
                let user = await UserModel.findById(user_id).exec();
                if (user) {
                    let assignment_string = "p" + phase + "_annotation_requests";
                    if (!user[assignment_string].includes(request._id)) {
                        user[assignment_string].push(request._id);
                        await user.save();
                    }
                }
            }
        }
    }
}

main();

console.log("Done.")