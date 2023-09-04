const mongoose = require('mongoose');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    request_timestamp: Date,
    submit_timestamp: Date,
    justification: String,
    include_in_next_phase: Boolean,
    assigned_user_id: mongoose.Schema.Types.ObjectId,
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;