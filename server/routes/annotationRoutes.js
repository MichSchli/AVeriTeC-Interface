const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const ArticleModel = require('../model/articleModel');
const ClaimNormAnnotationModel = require('../model/annotations/claimNormAnnotationModel');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const TrainingP2AnnotationRequestModel = require('../model/annotationRequests/trainingP2AnnotationRequestModel');
const TrainingP3AnnotationRequestModel = require('../model/annotationRequests/trainingP3AnnotationRequestModel');
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
        populate: [{
          path: 'article',
          model: 'Article',
        }, {
          path: 'annotation',
          model: 'ClaimNormAnnotation',
        }],
      })
    } else if (dataset === 'training') {
      annotationRequests = user.training_p1_annotation_requests;
      await user.populate({
        path: 'training_p1_annotation_requests',
        populate: [{
          path: 'article',
          model: 'Article',
        }, {
          path: 'annotation',
          model: 'ClaimNormAnnotation',
        }],
      })
    } else {
      return res.status(400).json({ message: 'Invalid dataset type' });
    }


    res.status(200).json({ annotationRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get P2 annotation requests or training requests for the user
router.post('/p2/:user_id', checkUserOrAdmin, async (req, res) => {
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
      annotationRequests = user.p2_annotation_requests;
      await user.populate({
        path: 'p2_annotation_requests',
        populate: [{
          path: 'article',
          model: 'Article',
        }, {
          path: 'annotation',
          model: 'QuestionAnnotation',
        }],
      })
    } else if (dataset === 'training') {
      annotationRequests = user.training_p2_annotation_requests;
      await user.populate({
        path: 'training_p2_annotation_requests',
        populate: [{
          path: 'article',
          model: 'Article',
        }, {
          path: 'annotation',
          model: 'QuestionAnnotation',
        }],
      })
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

    console.log("Submitting annotation for request " + annotation_request._id + " in dataset " + dataset + " in phase " + phase.toString());
    let annotationRequestClass = null;
    if (dataset === 'annotation') {
      if (phase === 1) {
        annotationRequestClass = P1AnnotationRequestModel;
      } else if (phase === 2) {
        annotationRequestClass = P2AnnotationRequestModel;
      } else if (phase === 3) {
        annotationRequestClass = P3AnnotationRequestModel;
      } else if (phase === 4) {
        annotationRequestClass = P4AnnotationRequestModel;
      } else if (phase === 5) {
        annotationRequestClass = P5AnnotationRequestModel;
      }
    } else if (dataset === 'training') {
      if (phase === 1) {
        annotationRequestClass = TrainingP1AnnotationRequestModel;
      } else if (phase === 2) {
        annotationRequestClass = TrainingP2AnnotationRequestModel;
      } else if (phase === 3) {
        annotationRequestClass = TrainingP3AnnotationRequestModel;
      }
    } else {
      return res.status(400).json({ message: 'Invalid dataset type' });
    }

    let dbAnnotationRequest = await annotationRequestClass.findById(annotation_request._id);

    if (!dbAnnotationRequest) {
      return res.status(404).json({ message: 'Annotation request not found' });
    }

    // If the submission has no annotation, throw an error
    if (!annotation_request.annotation) {
      return res.status(400).json({ message: 'Annotation is missing' });
    }

    // If the submission has an annotation in the DB, but the user is asking to skip, throw an error:
    if (dbAnnotationRequest.annotation && annotation_request.annotation.skipped) {
      return res.status(400).json({ message: 'Cannot skip annotation, as annotation has already been submitted' });
    }

    // If the annotation request has not been submitted before, set the first_submission_timestamp
    let first_time_flag = false;
    if (!dbAnnotationRequest.has_been_submitted) {
      dbAnnotationRequest.first_submission_timestamp = new Date();
      dbAnnotationRequest.has_been_submitted = true;
      first_time_flag = true;
    }

    // Set the last_submission_timestamp
    dbAnnotationRequest.last_submission_timestamp = new Date();
    dbAnnotationRequest.annotation = annotation_request.annotation;

    console.log("Saving annotation request " + dbAnnotationRequest._id + " with annotation " + JSON.stringify(annotation_request.annotation));

    // If it a training request or a skip, we are done:
    if (dataset === 'training' || annotation_request.annotation.skipped) {
      await dbAnnotationRequest.save();
      console.log("Annotation request " + dbAnnotationRequest._id + " saved. This is a training claim, or a skipped claim.")
      return res.status(200).json({ message: 'Annotation request submitted' });
    }

    // If this annotation has child requests, check to see if they have been assigned:
    let any_child_request_assigned = false;
    if (dbAnnotationRequest.child_requests) {
      for (let child_request_id of dbAnnotationRequest.child_requests) {
        let childRequestClass = P2AnnotationRequestModel;
        if (phase === 2) {
          childRequestClass = P3AnnotationRequestModel;
        } else if (phase === 3) {
          childRequestClass = P4AnnotationRequestModel;
        } else if (phase === 4) {
          childRequestClass = P5AnnotationRequestModel;
        }

        let child_request = await childRequestClass.findById(child_request_id);
        if (child_request.assigned_user) {
          any_child_request_assigned = true;
          break;
        }
      }
    }

    // If some child requests have been assigned, return an error:
    if (any_child_request_assigned) {
      return res.status(400).json({ message: 'Cannot change annotation, as the previous data has already been passed to another annotator in the next phase' });
    }

    // Delete all child requests:
    if (dbAnnotationRequest.child_requests) {
      let childRequestClass = P2AnnotationRequestModel;
      if (phase === 2) {
        childRequestClass = P3AnnotationRequestModel;
      } else if (phase === 3) {
        childRequestClass = P4AnnotationRequestModel;
      } else if (phase === 4) {
        childRequestClass = P5AnnotationRequestModel;
      }

      for (let child_request_id of dbAnnotationRequest.child_requests) {
        console.log("Deleting child request " + child_request_id)
        await childRequestClass.findByIdAndDelete(child_request_id);
      }
    }
    dbAnnotationRequest.child_requests = [];

    // In P1, create a child request for each claim in the annotation:
    if (phase === 1) {
      for (let claim of annotation_request.annotation.claims) {
        console.log("Creating child request for claim \"" + claim.claim + "\"")
        // If Speculative Claim, Opinion Claim, Media Publishing Claim, or Media Analysis Claim is in the list of claim types, skip the claim:
        let should_skip = false;
        for (let claim_type of claim.claim_types) {
          if (claim_type === "Speculative Claim" || claim_type === "Opinion Claim" || claim_type === "Media Publishing Claim" || claim_type === "Media Analysis Claim") {
            should_skip = true;
            break;
          }
        }

        // If the fact-checking strategies only includes Fact-checker Reference, skip the claim:
        if (claim.fact_checking_strategies.length === 1 && claim.fact_checking_strategies[0] === "Fact-checker Reference") {
          should_skip = true;
        }

        if (should_skip) {
          console.log("Skipping claim \"" + claim.claim + "\"")
          continue;
        }

        let child_request = new P2AnnotationRequestModel({
          article: dbAnnotationRequest.article,
          blocked_user_ids: [req.userId],
          p1_annotation: { claim },
        });
        await child_request.save();
        dbAnnotationRequest.child_requests.push(child_request._id);
      }
    }

    // In P2-P4, just create a single child request:
    if (phase === 2) {
      let child_request = new P3AnnotationRequestModel({
        article: dbAnnotationRequest.article,
        blocked_user_ids: [...dbAnnotationRequest.blocked_user_ids, req.userId],
        p1_annotation: dbAnnotationRequest.p1_annotation,
        p2_annotation: annotation_request.annotation,
      });
      await child_request.save();
      dbAnnotationRequest.child_requests.push(child_request._id);
    } else if (phase === 3) {
      let child_request = new P4AnnotationRequestModel({
        article: dbAnnotationRequest.article,
        blocked_user_ids: [...dbAnnotationRequest.blocked_user_ids, req.userId],
        p1_annotation: dbAnnotationRequest.p1_annotation,
        p2_annotation: dbAnnotationRequest.p2_annotation,
        p3_annotation: annotation_request.annotation,
      });
      await child_request.save();
      dbAnnotationRequest.child_requests.push(child_request._id);
    } else if (phase === 4) {
      let child_request = new P5AnnotationRequestModel({
        article: dbAnnotationRequest.article,
        blocked_user_ids: [...dbAnnotationRequest.blocked_user_ids, req.userId],
        p1_annotation: dbAnnotationRequest.p1_annotation,
        p2_annotation: dbAnnotationRequest.p2_annotation,
        p3_annotation: dbAnnotationRequest.p3_annotation,
        p4_annotation: annotation_request.annotation,
      });
      await child_request.save();
      dbAnnotationRequest.child_requests.push(child_request._id);
    }

    await dbAnnotationRequest.save();
    console.log("Annotation request " + dbAnnotationRequest._id + " saved. I have also created child requests where appropriate.")
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
      assigned: annotationRequests.filter((request) => request.assigned_user && !request.annotation).length,
      completed: annotationRequests.filter((request) => request.annotation && !request.annotation.skipped).length,
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

    return res.status(200).json(statistics);

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

    return res.status(200).json(statistics);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;