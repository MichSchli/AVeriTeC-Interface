const mongoose = require('mongoose');
const QuestionModel = require('./Question');
const UserModel = require('./userModel');

const questionAnnotationSchema = new mongoose.Schema({
    label: String,
    request_timestamp: Date,
    load_timestamp: Date,
    submit_timestamp: Date,
    questions: [QuestionModel.schema],
    search_queries: [String],
    skipped: Boolean,
    include_in_next_phase: Boolean,
    user: UserModel.schema,
});

const QuestionAnnotationModel = mongoose.model('QuestionAnnotation', questionAnnotationSchema);

module.exports = QuestionAnnotationModel;