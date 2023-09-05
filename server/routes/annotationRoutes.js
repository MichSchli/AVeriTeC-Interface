const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const ArticleModel = require('../model/articleModel');
const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const loginConfig = require('../config/login_config');
const {checkAdmin, checkUserOrAdmin, checkUserIsAssigned} = require('../middleware/authMiddleware');

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

      dbAnnotationRequest.has_been_submitted = true;
      dbAnnotationRequest.annotation = annotation_request.annotation;
      console.log(annotation_request.annotation.work_seconds);
      await dbAnnotationRequest.save();

      res.status(200).json({ message: 'Annotation request submitted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  module.exports = router;