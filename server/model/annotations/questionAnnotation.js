const mongoose = require('mongoose');
const QuestionModel = require('./Question');

const questionAnnotationSchema = new mongoose.Schema({
    label: String,
    load_seconds: Number,
    finish_seconds: Number,
    questions: [QuestionModel.schema],
});

const QuestionAnnotationModel = mongoose.model('QuestionAnnotation', questionAnnotationSchema);

module.exports = QuestionAnnotationModel;