const mongoose = require('mongoose');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    load_seconds: Number,
    work_seconds: Number,
    justification: String,
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;