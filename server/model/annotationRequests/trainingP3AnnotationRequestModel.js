const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const trainingP3AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    gold_annotations: [ControlAnnotationModel.schema],
});

const trainingP3AnnotationRequestModel = mongoose.model('trainingP3AnnotationRequest', trainingP3AnnotationRequestSchema);

module.exports = trainingP3AnnotationRequestModel;