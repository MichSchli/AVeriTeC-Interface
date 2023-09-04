const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const trainingP3AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    gold_annotations: [ControlAnnotationModel.schema],
});

const TrainingP3AnnotationRequestModel = mongoose.model('trainingP3AnnotationRequest', trainingP3AnnotationRequestSchema);

module.exports = TrainingP3AnnotationRequestModel;