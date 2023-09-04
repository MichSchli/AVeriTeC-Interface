const mongoose = require('mongoose');
const ClaimNormAnnotationModel = require('../annotations/claimNormAnnotationModel');

const trainingP1AnnotationRequestSchema = new mongoose.Schema({
    article_id: mongoose.Schema.Types.ObjectId,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
    p1_annotation: ClaimNormAnnotationModel.schema,
    gold_annotations: [ClaimNormAnnotationModel.schema],
});

const TrainingP1AnnotationRequestModel = mongoose.model('TrainingP1AnnotationRequest', trainingP1AnnotationRequestSchema);

module.exports = TrainingP1AnnotationRequestModel;