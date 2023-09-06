const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');

const trainingP1AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    annotation: ClaimNormAnnotationModel.schema,
    has_been_submitted: Boolean,
    gold_annotations: [ClaimNormAnnotationModel.schema],
    request_made_timestamp: Date,
    first_submission_timestamp: Date,
    last_submission_timestamp: Date,
});

const TrainingP1AnnotationRequestModel = mongoose.model('TrainingP1AnnotationRequest', trainingP1AnnotationRequestSchema);

module.exports = TrainingP1AnnotationRequestModel;