const mongoose = require('mongoose');

const searchRecordSchema = new mongoose.Schema({
    query: String,
    p2_annotation_request: { type: mongoose.Schema.Types.ObjectId, ref: 'P2AnnotationRequest' },
    p4_annotation_request: { type: mongoose.Schema.Types.ObjectId, ref: 'P4AnnotationRequest' },
    training_p2_annotation_request: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingP2AnnotationRequest' },
    page: Number,
    result_urls: [String],
    timestamp: Date,
    location_ISO_code: String,
    cutoff_timestamp: Date
});

const SearchRecordModel = mongoose.model('SearchRecord', searchRecordSchema);

module.exports = SearchRecordModel;