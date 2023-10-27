const mongoose = require('mongoose');
const QuestionModel = require('../questionModel');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    load_seconds: Number,
    work_seconds: Number,
    justification: String,
    unreadable: Boolean,
    questions: [QuestionModel.schema],
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;