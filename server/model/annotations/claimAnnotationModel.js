const mongoose = require('mongoose');

const claimAnnotationSchema = new mongoose.Schema({
    claim: String,
    label: String,
    claim_date: Date,
    speaker: String,
    transcription: String,
    media_source: String,
    original_claim_url: String,
    cached_original_claim_url: String,
    reporting_source: String,
    location_ISO_code: String,
    claim_types: [String],
    fact_checking_strategies: [String],
});

const ClaimAnnotationModel = mongoose.model('ClaimAnnotation', claimAnnotationSchema);
module.exports = ClaimAnnotationModel;