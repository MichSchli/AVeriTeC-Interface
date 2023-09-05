const mongoose = require('mongoose');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    load_seconds: Number,
    work_seconds: Number,
    justification: String,
    include_in_next_phase: Boolean,
    assigned_user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;