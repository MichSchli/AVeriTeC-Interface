const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const p3AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blocked_user_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    annotation: ControlAnnotationModel.schema,
    has_been_submitted: Boolean,
    request_made_timestamp: Date,
    first_submission_timestamp: Date,
    last_submission_timestamp: Date,
});

const P3AnnotationRequestModel = mongoose.model('P3AnnotationRequest', p3AnnotationRequestSchema);

module.exports = P3AnnotationRequestModel;