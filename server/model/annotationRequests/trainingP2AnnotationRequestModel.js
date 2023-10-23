const mongoose = require('mongoose');
const ClaimAnnotationModel = require('../annotations/claimAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const trainingP2AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    p1_annotation: ClaimAnnotationModel.schema,
    annotation: QuestionAnnotationModel.schema,
    gold_annotations: [QuestionAnnotationModel.schema],
    other_extracted_claims: [String],
    has_been_submitted: Boolean,
    request_made_timestamp: Date,
    first_submission_timestamp: Date,
    last_submission_timestamp: Date,
});

const TrainingP2AnnotationRequestModel = mongoose.model('TrainingP2AnnotationRequest', trainingP2AnnotationRequestSchema);

module.exports = TrainingP2AnnotationRequestModel;