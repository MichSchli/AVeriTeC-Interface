const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const p2AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blocked_user_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    p1_annotation: ClaimNormAnnotationModel.schema,
    annotation: QuestionAnnotationModel.schema,
    has_been_submitted: Boolean,
});

const P2AnnotationRequestModel = mongoose.model('P2AnnotationRequest', p2AnnotationRequestSchema);

module.exports = P2AnnotationRequestModel;