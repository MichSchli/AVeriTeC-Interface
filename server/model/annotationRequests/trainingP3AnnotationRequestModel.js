const mongoose = require('mongoose');
const ClaimAnnotationModel = require('../annotations/claimAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const trainingP3AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    p1_annotation: ClaimAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    annotation: ControlAnnotationModel.schema,
    gold_annotations: [ControlAnnotationModel.schema],
    has_been_submitted: Boolean,
    request_made_timestamp: Date,
    first_submission_timestamp: Date,
    last_submission_timestamp: Date,
});

const TrainingP3AnnotationRequestModel = mongoose.model('TrainingP3AnnotationRequest', trainingP3AnnotationRequestSchema);

module.exports = TrainingP3AnnotationRequestModel;