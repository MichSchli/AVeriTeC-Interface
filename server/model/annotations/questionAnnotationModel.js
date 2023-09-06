const mongoose = require('mongoose');
const QuestionModel = require('../questionModel');

const questionAnnotationSchema = new mongoose.Schema({
    label: String,
    work_seconds: Number,
    questions: [QuestionModel.schema],
    search_queries: [String],
    skipped: Boolean,
    skipped_reason: String,
    include_in_next_phase: Boolean,
    assigned_user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

const QuestionAnnotationModel = mongoose.model('QuestionAnnotation', questionAnnotationSchema);

module.exports = QuestionAnnotationModel;