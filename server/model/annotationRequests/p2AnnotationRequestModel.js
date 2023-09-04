const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const p2AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    blocked_user_ids: [mongoose.Schema.Types.ObjectId],
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
});

const P2AnnotationRequestModel = mongoose.model('P2AnnotationRequest', p2AnnotationRequestSchema);

module.exports = P2AnnotationRequestModel;