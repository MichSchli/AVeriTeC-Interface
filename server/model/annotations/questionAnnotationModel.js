const mongoose = require('mongoose');
const QuestionModel = require('../questionModel');

const questionAnnotationSchema = new mongoose.Schema({
    label: String,
    request_timestamp: Date,
    load_timestamp: Date,
    submit_timestamp: Date,
    questions: [QuestionModel.schema],
    search_queries: [String],
    skipped: Boolean,
    include_in_next_phase: Boolean,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
});

const QuestionAnnotationModel = mongoose.model('QuestionAnnotation', questionAnnotationSchema);

module.exports = QuestionAnnotationModel;