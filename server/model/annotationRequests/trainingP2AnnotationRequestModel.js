const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');

const trainingP2AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    p1_annotation: ClaimNormAnnotationModel.schema,
    annotation: QuestionAnnotationModel.schema,
    gold_annotations: [QuestionAnnotationModel.schema],
    has_been_submitted: Boolean,
});

const TrainingP2AnnotationRequestModel = mongoose.model('trainingP2AnnotationRequest', trainingP2AnnotationRequestSchema);

module.exports = TrainingP2AnnotationRequestModel;