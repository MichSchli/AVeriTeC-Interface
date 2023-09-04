const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const p3AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    blocked_user_ids: [mongoose.Schema.Types.ObjectId],
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
});

const P3AnnotationRequestModel = mongoose.model('P3AnnotationRequest', p3AnnotationRequestSchema);

module.exports = P3AnnotationRequestModel;