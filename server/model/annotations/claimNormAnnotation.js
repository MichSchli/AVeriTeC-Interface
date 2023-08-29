const mongoose = require('mongoose');
const QuestionModel = require('./Question');
const ArticleModel = require('./Article');

const claimNormAnnotationSchema = new mongoose.Schema({
    claim: String,
    label: String,
    claim_date: Date,
    speaker: String,
    original_claim_url: String,
    cached_original_claim_url: String,
    reporting_source: String,
    location_ISO_code: String,
    load_seconds: Number,
    finish_seconds: Number,
    claim_types: [String],
    fact_checking_strategies: [String],
});

const ClaimNormAnnotationModel = mongoose.model('ClaimNormAnnotation', claimNormAnnotationSchema);

module.exports = ClaimNormAnnotationModel;