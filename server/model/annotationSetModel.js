const mongoose = require('mongoose');
const QuestionModel = require('./Question');
const ArticleModel = require('./Article');
const ClaimNormAnnotationModel = require('./annotations/claimNormAnnotation');
const QuestionAnnotationModel = require('./annotations/questionAnnotation');
const ControlAnnotationModel = require('./annotations/controlAnnotation');

const annotationSetSchema = new mongoose.Schema({
    fact_checking_article: ArticleModel.schema,
    p1__annotation: ClaimNormAnnotationModel.schema,
    p2_annotation: QuestionAnnotationModel.schema,
    p3_annotation: ControlAnnotationModel.schema,
    p4_annotation: QuestionAnnotationModel.schema,
    p5_annotation: ControlAnnotationModel.schema,
});

const AnnotationSetModel = mongoose.model('AnnotationSet', annotationSetSchema);

module.exports = ClaimModel;