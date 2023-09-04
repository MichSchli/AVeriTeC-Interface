const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');

const p1AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    blocked_user_ids: [mongoose.Schema.Types.ObjectId],
    annotation: ClaimNormAnnotationModel.schema,
});

const P1AnnotationRequestModel = mongoose.model('P1AnnotationRequest', p1AnnotationRequestSchema);

module.exports = P1AnnotationRequestModel;