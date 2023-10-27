const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    answer: String,
    boolean_explanation: String,
    answer_type: String,
    source_url: String,
    cached_source_url: String,
    source_medium: String,
    answer_problems: [String],
});

const questionSchema = new mongoose.Schema({
    question: String,
    answers: [answerSchema],
    question_problems: [String],
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = QuestionModel;