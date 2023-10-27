const mongoose = require('mongoose');
const ClaimAnnotationModel = require('../annotations/claimAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const p2AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blocked_user_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    p1_annotation: ClaimAnnotationModel.schema,
    annotation: QuestionAnnotationModel.schema,
    other_extracted_claims: [String],
    has_been_submitted: Boolean,
    request_made_timestamp: Date,
    first_submission_timestamp: Date,
    last_submission_timestamp: Date,
    child_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P3AnnotationRequest'}],
});

const P2AnnotationRequestModel = mongoose.model('P2AnnotationRequest', p2AnnotationRequestSchema);

module.exports = P2AnnotationRequestModel;