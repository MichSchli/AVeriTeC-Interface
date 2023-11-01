const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportReason: {
        type: String,
        required: true,
    },
    suggestedAction: {
        type: String,
        required: true,
    },
    annotationRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    phase: {
        type: Number,
        required: true
    },
    status: {
        type: String, // Report status tracks where in the system the report is. Options: pending, submitted, verified, deleted.
        required: true
    }
});

const ReportModel = mongoose.model('Report', reportSchema);

module.exports = ReportModel;