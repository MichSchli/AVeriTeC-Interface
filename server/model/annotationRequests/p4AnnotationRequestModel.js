const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const p4AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blocked_user_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    annotation: QuestionAnnotationModel.schema,
    has_been_submitted: Boolean,
});

const P4AnnotationRequestModel = mongoose.model('P4AnnotationRequest', p4AnnotationRequestSchema);

module.exports = P4AnnotationRequestModel;