const e = require('express');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const TrainingP2AnnotationRequestModel = require('../model/annotationRequests/trainingP2AnnotationRequestModel');
const TrainingP3AnnotationRequestModel = require('../model/annotationRequests/trainingP3AnnotationRequestModel');
const mongoose = require('mongoose');

const createTrainingRequests = async (user, phase) => {
  // Get the template training requests (requests with no user) from the db:
  let templateRequests = null;
  if (phase == 1) {
    templateRequests = await TrainingP1AnnotationRequestModel.find({ assigned_user: null }).exec();
    if (!user.training_p1_annotation_requests) {
      user.training_p1_annotation_requests = [];
    }
  } else if (phase == 2) {
    templateRequests = await TrainingP2AnnotationRequestModel.find({ assigned_user: null }).exec();
    if (!user.training_p2_annotation_requests) {
      user.training_p2_annotation_requests = [];
    }
  } else if (phase == 3) {
    templateRequests = await TrainingP3AnnotationRequestModel.find({ assigned_user: null }).exec();
    if (!user.training_p3_annotation_requests) {
      user.training_p3_annotation_requests = [];
    }
  }

  await user.save();

  // Create copies of the template requests for the user. Must happen sequentially.
  for (let i = 0; i < templateRequests.length; i++) {
    const templateRequest = templateRequests[i];

    let requestModel = null;
    if (phase == 1) {
      requestModel = TrainingP1AnnotationRequestModel;
    } else if (phase == 2) {
      requestModel = TrainingP2AnnotationRequestModel;
    } else if (phase == 3) {
      requestModel = TrainingP3AnnotationRequestModel;
    }

    const newRequest = new requestModel({
      ...templateRequest.toObject(),
      _id: new mongoose.Types.ObjectId(),
      assigned_user: user._id,
    });

    // Add current time to the request_made_timestamp:
    newRequest.request_made_timestamp = new Date();

    // Save the new request and add the ID to the user:
    await newRequest.save();

    if (phase == 1) {
      user.training_p1_annotation_requests.push(newRequest._id);
    } else if (phase == 2) {
      user.training_p2_annotation_requests.push(newRequest._id);
    } else if (phase == 3) {
      user.training_p3_annotation_requests.push(newRequest._id);
    }
    
    await user.save();

    console.log(
      `Successfully inserted training annotation request for user id ${user._id} and article id ${newRequest.article}`
    );
  }

  console.log(`Successfully created training requests for user id ${user._id}`);
}

const resetUserTrainingRequests = async (user, phase) => {
  // Get the template training requests (requests with no user) from the db:
  let templateRequests = null;
  if (phase == 1) {
    templateRequests = await TrainingP1AnnotationRequestModel.find({ assigned_user: null }).exec();
    user.training_p1_annotation_requests = [];
  } else if (phase == 2) {
    templateRequests = await TrainingP2AnnotationRequestModel.find({ assigned_user: null }).exec();
    user.training_p2_annotation_requests = [];
  } else if (phase == 3) {
    templateRequests = await TrainingP3AnnotationRequestModel.find({ assigned_user: null }).exec();
    user.training_p3_annotation_requests = [];
  }

  await user.save();

  // Create copies of the template requests for the user. Must happen sequentially.
  for (let i = 0; i < templateRequests.length; i++) {
    const templateRequest = templateRequests[i];

    let requestModel = null;
    if (phase == 1) {
      requestModel = TrainingP1AnnotationRequestModel;
    } else if (phase == 2) {
      requestModel = TrainingP2AnnotationRequestModel;
    } else if (phase == 3) {
      requestModel = TrainingP3AnnotationRequestModel;
    }

    const newRequest = new requestModel({
      ...templateRequest.toObject(),
      _id: new mongoose.Types.ObjectId(),
      assigned_user: user._id,
    });

    // Add current time to the request_made_timestamp:
    newRequest.request_made_timestamp = new Date();

    // Save the new request and add the ID to the user:
    await newRequest.save();

    if (phase == 1) {
      user.training_p1_annotation_requests.push(newRequest._id);
    } else if (phase == 2) {
      user.training_p2_annotation_requests.push(newRequest._id);
    } else if (phase == 3) {
      user.training_p3_annotation_requests.push(newRequest._id);
    }

    await user.save();

    console.log(
      `Successfully inserted training annotation request for user id ${user._id} and article id ${newRequest.article}`
    );
  }

  console.log(`Successfully reset training requests for user id ${user._id}`);
}


module.exports = {
  createTrainingRequests: createTrainingRequests,
  resetTrainingRequests: resetUserTrainingRequests
};
