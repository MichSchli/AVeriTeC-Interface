const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const p4AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    p4_annotation: QuestionAnnotationModel.schema,
    blocked_users: [UserModel.schema],
});

const P4AnnotationRequestModel = mongoose.model('P4AnnotationRequest', p4AnnotationRequestSchema);

module.exports = P4AnnotationRequestModel;