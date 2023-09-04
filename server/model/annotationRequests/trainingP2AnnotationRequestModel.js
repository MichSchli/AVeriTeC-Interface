const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const trainingP2AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    gold_annotations: [QuestionAnnotationModel.schema],
});

const TrainingP2AnnotationRequestModel = mongoose.model('trainingP2AnnotationRequest', trainingP2AnnotationRequestSchema);

module.exports = TrainingP2AnnotationRequestModel;