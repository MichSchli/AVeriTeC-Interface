const mongoose = require('mongoose');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    finish_seconds: Number,
    justification: String,
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;