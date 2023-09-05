const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Boolean,
        required: true,
    },
    is_active: {   
        type: Boolean,
        required: true,
    },
    p1_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P1AnnotationRequest'}],
    p2_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P2AnnotationRequest'}],
    p3_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P3AnnotationRequest'}],
    p4_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P4AnnotationRequest'}],
    p5_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'P5AnnotationRequest'}],
    training_p1_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'TrainingP1AnnotationRequest'}],
    training_p2_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'TrainingP2AnnotationRequest'}],
    training_p3_annotation_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'TrainingP3AnnotationRequest'}],
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;