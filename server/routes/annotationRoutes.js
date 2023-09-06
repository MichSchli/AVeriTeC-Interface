const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const ArticleModel = require('../model/articleModel');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const loginConfig = require('../config/login_config');
const { checkAdmin, checkUserOrAdmin, checkUserIsAssigned } = require('../middleware/authMiddleware');

// Route to get P1 annotation requests or training requests for the user
router.post('/p1/:user_id', checkUserOrAdmin, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { dataset } = req.body;

    console.log("Fetching " + dataset + " requests for user " + user_id)

    const user = await UserModel.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let annotationRequests;
    if (dataset === 'annotation') {
      annotationRequests = user.p1_annotation_requests;
      await user.populate({
        path: 'p1_annotation_requests',
        populate: {
          path: 'article',
          model: 'Article',
        },
      });
    } else if (dataset === 'training') {
      annotationRequests = user.training_p1_annotation_requests;
      await user.populate({
        path: 'training_p1_annotation_requests',
        populate: {
          path: 'article',
          model: 'Article',
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid dataset type' });
    }


    res.status(200).json({ annotationRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to submit an edit for an annotation request
router.post('/submit', checkUserIsAssigned, async (req, res) => {
  try {
    const { annotation_request, dataset, phase } = req.body;

    console.log("Submitting P1 annotation for request " + annotation_request._id + " in dataset " + dataset + " in phase " + phase.toString());

    let dbAnnotationRequest;

    if (dataset === 'annotation') {
      dbAnnotationRequest = await P1AnnotationRequestModel.findById(annotation_request._id);
    } else if (dataset === 'training') {
      dbAnnotationRequest = await TrainingP1AnnotationRequestModel.findById(annotation_request._id);
    } else {
      return res.status(400).json({ message: 'Invalid dataset type' });
    }

    if (!dbAnnotationRequest) {
      return res.status(404).json({ message: 'Annotation request not found' });
    }

    // IF the submission has no annotation, throw an error
    if (!annotation_request.annotation) {
      return res.status(400).json({ message: 'Annotation is missing' });
    }

    // If the annotation request has not been submitted before, set the first_submission_timestamp
    if (!dbAnnotationRequest.has_been_submitted) {
      dbAnnotationRequest.first_submission_timestamp = new Date();
      dbAnnotationRequest.has_been_submitted = true;
    }

    // Set the last_submission_timestamp
    dbAnnotationRequest.last_submission_timestamp = new Date();
    dbAnnotationRequest.annotation = annotation_request.annotation;

    await dbAnnotationRequest.save();

    res.status(200).json({ message: 'Annotation request submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get statistics for a phase (post because the phase is in the body)
router.post('/statistics', checkAdmin, async (req, res) => {
  try {
    const { phase } = req.body;

    console.log("Fetching statistics for phase " + phase.toString());

    let annotationRequests;

    if (phase === 1) {
      annotationRequests = await P1AnnotationRequestModel.find().populate("article");
    } else if (phase === 2) {
      annotationRequests = await P2AnnotationRequestModel.find().populate("article");
    } else if (phase === 3) {
      annotationRequests = await P3AnnotationRequestModel.find().populate("article");
    } else if (phase === 4) {
      annotationRequests = await P4AnnotationRequestModel.find().populate("article");
    } else if (phase === 5) {
      annotationRequests = await P5AnnotationRequestModel.find().populate("article");
    } else {
      return res.status(400).json({ message: 'Invalid phase' });
    }

    let statistics = {
      assigned: annotationRequests.filter((request) => request.assigned_user).length,
      completed: annotationRequests.filter((request) => request.annotation).length,
      pending: annotationRequests.filter((request) => request.assigned_user === undefined).length,
      total: annotationRequests.length,
      skipped: annotationRequests.filter((request) => request.annotation && request.annotation.skipped).length,
    };

    // Compute average task time for completed annotations:
    let total_time = 0;
    let total_load_time = 0;
    let completed_annotations = annotationRequests.filter((request) => request.annotation);
    for (let request of completed_annotations) {
      total_time += request.annotation.work_seconds;
      total_load_time += request.annotation.load_seconds ? request.annotation.load_seconds : 0;
    }

    statistics.average_task_time = total_time / completed_annotations.length;
    statistics.average_load_time = total_load_time / completed_annotations.length;

    return res.status(200).json( statistics );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route that computes how many pending claims there are for each phase:
router.get('/pending_by_phase', checkAdmin, async (req, res) => {
  try {
    let statistics = {};

    for (let phase = 1; phase <= 5; phase++) {
      let annotationRequests;
      if (phase === 1) {
        annotationRequests = await P1AnnotationRequestModel.find().populate("article");
      } else if (phase === 2) {
        annotationRequests = await P2AnnotationRequestModel.find().populate("article");
      } else if (phase === 3) {
        annotationRequests = await P3AnnotationRequestModel.find().populate("article");
      } else if (phase === 4) {
        annotationRequests = await P4AnnotationRequestModel.find().populate("article");
      } else if (phase === 5) {
        annotationRequests = await P5AnnotationRequestModel.find().populate("article");
      }

      statistics["phase_" + phase.toString()] = annotationRequests.filter((request) => request.assigned_user === undefined).length;
    }

    return res.status(200).json( statistics );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;