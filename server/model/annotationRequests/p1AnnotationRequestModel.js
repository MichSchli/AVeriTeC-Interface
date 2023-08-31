const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');
const ArticleModel = require('./articleModel');
const UserModel = require('./userModel');

const p1AnnotationRequestSchema = new mongoose.Schema({
    article: ArticleModel.schema,
    assigned_user: UserModel.schema,
    annotation: ClaimNormAnnotationModel.schema,
    blocked_users: [UserModel.schema],
});

const P1AnnotationRequestModel = mongoose.model('P1AnnotationRequest', p1AnnotationRequestSchema);

module.exports = P1AnnotationRequestModel;