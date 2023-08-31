const mongoose = require('mongoose');
const UserModel = require('./userModel');

const controlAnnotationModelSchema = new mongoose.Schema({
    label: String,
    request_timestamp: Date,
    submit_timestamp: Date,
    justification: String,
    include_in_next_phase: Boolean,
    user: UserModel.schema,
});

const ControlAnnotationModel = mongoose.model('ControlAnnotation', controlAnnotationModelSchema);

module.exports = ControlAnnotationModel;