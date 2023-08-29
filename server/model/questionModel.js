const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    answer: String,
    answer_type: String,
    source_url: String,
    cached_source_url: String,
    source_medium: String,
});

const questionSchema = new mongoose.Schema({
    question: String,
    answers: [answerSchema],
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = QuestionModel;