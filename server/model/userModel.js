const mongoose = require('mongoose');
const P1AnnotationRequestModel = require('./annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('./annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('./annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('./annotationRequests/p4AnnotationRequestModel'); 
const P5AnnotationRequestModel = require('./annotationRequests/p5AnnotationRequestModel'); 
const TrainingP1AnnotationRequestModel = require('./annotationRequests/trainingP1AnnotationRequestModel');
const TrainingP2AnnotationRequestModel = require('./annotationRequests/trainingP2AnnotationRequestModel');
const TrainingP3AnnotationRequestModel = require('./annotationRequests/trainingP3AnnotationRequestModel');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Boolean,
        required: true,
    },
    is_active: {   
        type: Boolean,
        required: true,
    },
    p1_annotation_requests: [P1AnnotationRequestModel.schema],
    p2_annotation_requests: [P2AnnotationRequestModel.schema],
    p3_annotation_requests: [P3AnnotationRequestModel.schema],
    p4_annotation_requests: [P4AnnotationRequestModel.schema],
    p5_annotation_requests: [P5AnnotationRequestModel.schema],
    training_p1_annotation_requests: [TrainingP1AnnotationRequestModel.schema],
    training_p2_annotation_requests: [TrainingP2AnnotationRequestModel.schema],
    training_p3_annotation_requests: [TrainingP3AnnotationRequestModel.schema],
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;