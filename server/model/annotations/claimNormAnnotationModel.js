const mongoose = require('mongoose');
const ClaimAnnotationModel = require('../annotations/claimAnnotationModel');

const claimNormAnnotationSchema = new mongoose.Schema({
    claims: [ClaimAnnotationModel.schema],
    skipped: Boolean,
    load_seconds: Number,
    work_seconds: Number,
});

const ClaimNormAnnotationModel = mongoose.model('ClaimNormAnnotation', claimNormAnnotationSchema);
module.exports = ClaimNormAnnotationModel;
