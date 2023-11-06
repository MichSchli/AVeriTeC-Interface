const express = require('express');
const router = express.Router();
const { checkAdmin, checkUserOrAdmin } = require('../middleware/authMiddleware');
const ReportModel = require('../model/reportModel');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');



// Route to get all reports with a specific status and phase
router.post('/all', checkAdmin, async (req, res) => {
    try {
        const { phase, status } = req.body;

        console.log("Getting reports with phase " + phase + " and status " + status)

        // Check if the phase is valid
        if (phase < 1 || phase > 5) {
            return res.status(400).json({ message: "Invalid phase" });
        }

        // Check if the status is valid
        if (status != "pending" && status != "submitted" && status != "accepted" && status != "rejected") {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Get the reports
        let reports = await ReportModel.find({ phase: phase, status: status }).lean().exec();

        // Get the request class
        let RequestClass = null;
        switch (phase) {
            case 1:
                RequestClass = P1AnnotationRequestModel;
                break;
            case 2:
                RequestClass = P2AnnotationRequestModel;
                break;
            case 3:
                RequestClass = P3AnnotationRequestModel;
                break;
            case 4:
                RequestClass = P4AnnotationRequestModel;
                break;
            case 5:
                RequestClass = P5AnnotationRequestModel;
                break;
        }

        // Decorate the reports with the annotation request
        for (let i = 0; i < reports.length; i++) {
            let report = reports[i];
            const request = await RequestClass.findById(report.annotationRequestId).populate('article').exec();
            report.annotationRequest = request;
        }

        return res.status(200).json({ reports: reports });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Route to update a report
router.post('/update', checkAdmin, async (req, res) => {
    try {
        const { report } = req.body;

        // Check if the report exists
        let dbReport = await ReportModel.findById(report._id).exec();

        if (!dbReport) {
            return res.status(400).json({ message: "Report does not exist" });
        }

        // Update the report
        dbReport.status = report.status;
        dbReport.reportReason = report.reportReason;
        dbReport.suggestedAction = report.suggestedAction;
        dbReport.save();

        return res.status(200).json({ message: "Report updated" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Route at reports/overview to get done/total reports for each phase
router.get('/overview', checkUserOrAdmin, async (req, res) => {
    try {
        var reports_initial = {}
        var reports_confirm = {}

        // Initial are reports with status pending, submitted, or skipped. Pending are not done.
        var reports_initial_p1 = await ReportModel.find({ phase: 1, status: { $in: ["pending", "submitted", "skipped"] } }).lean().exec();
        var reports_initial_p2 = await ReportModel.find({ phase: 2, status: { $in: ["pending", "submitted", "skipped"] } }).lean().exec();
        var reports_initial_p3 = await ReportModel.find({ phase: 3, status: { $in: ["pending", "submitted", "skipped"] } }).lean().exec();
        var reports_initial_p4 = await ReportModel.find({ phase: 4, status: { $in: ["pending", "submitted", "skipped"] } }).lean().exec();
        var reports_initial_p5 = await ReportModel.find({ phase: 5, status: { $in: ["pending", "submitted", "skipped"] } }).lean().exec();

        reports_initial = {
            "phase_1": {
                "done": reports_initial_p1.filter(report => report.status != "pending").length,
                "total": reports_initial_p1.length
            },
            "phase_2": {
                "done": reports_initial_p2.filter(report => report.status != "pending").length,
                "total": reports_initial_p2.length
            },
            "phase_3": {
                "done": reports_initial_p3.filter(report => report.status != "pending").length,
                "total": reports_initial_p3.length
            },
            "phase_4": {
                "done": reports_initial_p4.filter(report => report.status != "pending").length,
                "total": reports_initial_p4.length
            },
            "phase_5": {
                "done": reports_initial_p5.filter(report => report.status != "pending").length,
                "total": reports_initial_p5.length
            }
        }

        // Confirm are reports with status submitted, accepted, or rejected. Accepted and rejected are done.

        var reports_confirm_p1 = await ReportModel.find({ phase: 1, status: { $in: ["submitted", "accepted", "rejected"] } }).lean().exec();
        var reports_confirm_p2 = await ReportModel.find({ phase: 2, status: { $in: ["submitted", "accepted", "rejected"] } }).lean().exec();
        var reports_confirm_p3 = await ReportModel.find({ phase: 3, status: { $in: ["submitted", "accepted", "rejected"] } }).lean().exec();
        var reports_confirm_p4 = await ReportModel.find({ phase: 4, status: { $in: ["submitted", "accepted", "rejected"] } }).lean().exec();
        var reports_confirm_p5 = await ReportModel.find({ phase: 5, status: { $in: ["submitted", "accepted", "rejected"] } }).lean().exec();

        reports_confirm = {
            "phase_1": {
                "done": reports_confirm_p1.filter(report => report.status != "submitted").length,
                "total": reports_confirm_p1.length
            },
            "phase_2": {
                "done": reports_confirm_p2.filter(report => report.status != "submitted").length,
                "total": reports_confirm_p2.length
            },
            "phase_3": {
                "done": reports_confirm_p3.filter(report => report.status != "submitted").length,
                "total": reports_confirm_p3.length
            },
            "phase_4": {
                "done": reports_confirm_p4.filter(report => report.status != "submitted").length,
                "total": reports_confirm_p4.length
            },
            "phase_5": {
                "done": reports_confirm_p5.filter(report => report.status != "submitted").length,
                "total": reports_confirm_p5.length
            }
        }

        return res.status(200).json({ reports_initial: reports_initial, reports_confirm: reports_confirm });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;