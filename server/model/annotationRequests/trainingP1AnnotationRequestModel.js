const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const trainingP1AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    annotation: ClaimNormAnnotationModel.schema,
    gold_annotations: [ClaimNormAnnotationModel.schema],
});

const trainingP1AnnotationRequestModel = mongoose.model('trainingP1AnnotationRequest', trainingP1AnnotationRequestSchema);

module.exports = trainingP1AnnotationRequestModel;