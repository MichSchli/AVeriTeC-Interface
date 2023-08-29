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
});

const ReportModel = mongoose.model('Report', reportSchema);

module.exports = ReportModel;