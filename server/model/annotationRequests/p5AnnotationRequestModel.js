const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const QuestionAnnotationModel = require('../annotations/questionAnnotationModel');
const ControlAnnotationModel = require('../annotations/controlAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const p5AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    p1_annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    p4_annotation: QuestionAnnotationModel.schema,
    p5_annotation: ControlAnnotationModel.schema,
    blocked_users: [UserModel.schema],
});

const P5AnnotationRequestModel = mongoose.model('P5AnnotationRequest', p5AnnotationRequestSchema);

module.exports = P5AnnotationRequestModel;