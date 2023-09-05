const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');

const p1AnnotationRequestSchema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    assigned_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blocked_user_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    has_been_submitted: Boolean,
    annotation: ClaimNormAnnotationModel.schema,
});

const P1AnnotationRequestModel = mongoose.model('P1AnnotationRequest', p1AnnotationRequestSchema);

module.exports = P1AnnotationRequestModel;