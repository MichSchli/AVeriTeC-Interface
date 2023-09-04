const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const p5AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    blocked_user_ids: [mongoose.Schema.Types.ObjectId],
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    p4_annotation: QuestionAnnotationModel.schema,
    p5_annotation: ControlAnnotationModel.schema,
});

const P5AnnotationRequestModel = mongoose.model('P5AnnotationRequest', p5AnnotationRequestSchema);

module.exports = P5AnnotationRequestModel;