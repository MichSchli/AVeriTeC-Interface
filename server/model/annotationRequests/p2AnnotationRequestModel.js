const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const p2AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    blocked_users: [UserModel.schema],
});

const P2AnnotationRequestModel = mongoose.model('P2AnnotationRequest', p2AnnotationRequestSchema);

module.exports = P2AnnotationRequestModel;