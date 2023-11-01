const express = require('express');
const router = express.Router();
const ReportModel = require('../model/reportModel');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');


// Route to get all reports with a specific status and phase
router.post('/all', checkAdmin, async (req, res) => {
    const { phase, status } = req.body;

});

// Route to update a report
router.post('/update', checkAdmin, async (req, res) => {

});
