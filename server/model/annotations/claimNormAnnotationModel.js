const mongoose = require('mongoose');

const claimNormAnnotationSchema = new mongoose.Schema({
    claim: String,
    label: String,
    claim_date: Date,
    speaker: String,
    original_claim_url: String,
    cached_original_claim_url: String,
    reporting_source: String,
    location_ISO_code: String,
    request_timestamp: Date,
    load_timestamp: Date,
    submit_timestamp: Date,
    skipped: Boolean,
    claim_types: [String],
    fact_checking_strategies: [String],
    assigned_user_id: mongoose.Schema.Types.ObjectId,
});

const ClaimNormAnnotationModel = mongoose.model('ClaimNormAnnotation', claimNormAnnotationSchema);

module.exports = ClaimNormAnnotationModel;