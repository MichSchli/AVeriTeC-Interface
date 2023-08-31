const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const trainingP2AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    gold_annotations: [QuestionAnnotationModel.schema],
});

const trainingP2AnnotationRequestModel = mongoose.model('trainingP2AnnotationRequest', trainingP2AnnotationRequestSchema);

module.exports = trainingP2AnnotationRequestModel;