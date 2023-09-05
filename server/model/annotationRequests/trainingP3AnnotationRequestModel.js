const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');

const trainingP3AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    annotation: ControlAnnotationModel.schema,
    gold_annotations: [ControlAnnotationModel.schema],
    has_been_submitted: Boolean,
});

const TrainingP3AnnotationRequestModel = mongoose.model('trainingP3AnnotationRequest', trainingP3AnnotationRequestSchema);

module.exports = TrainingP3AnnotationRequestModel;