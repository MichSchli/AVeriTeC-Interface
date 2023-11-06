const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportReason: String,
    suggestedAction: String,
    annotationRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    phase: {
        type: Number,
        required: true
    },
    status: {
        type: String, // Report status tracks where in the system the report is. Options: pending, submitted, skipped, accepted, rejected.
        required: true
    }
});

const ReportModel = mongoose.model('Report', reportSchema);

module.exports = ReportModel;