const mongoose = require('mongoose');
const QuestionModel = require('../questionModel');

const questionAnnotationSchema = new mongoose.Schema({
    label: String,
    work_seconds: Number,
    questions: [QuestionModel.schema],
    search_queries: [String],
    claim_correction: String,
    should_correct: Boolean,
    skipped: Boolean,
    skipped_reason: String,
});

const QuestionAnnotationModel = mongoose.model('QuestionAnnotation', questionAnnotationSchema);

module.exports = QuestionAnnotationModel;