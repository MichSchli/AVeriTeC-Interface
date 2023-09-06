const e = require('express');
const TrainingP1AnnotationRequestModel = require('../model/annotationRequests/trainingP1AnnotationRequestModel');
const mongoose = require('mongoose');

const createTrainingRequests = async (user) => {
  try {
    // Get the template training requests (requests with no user) from the db:
    const templateRequests = await TrainingP1AnnotationRequestModel.find({ assigned_user: null }).exec();

    // Create copies of the template requests for the new user:
    await Promise.all(
      templateRequests.map(async (templateRequest) => {
        const newRequest = new TrainingP1AnnotationRequestModel({
          ...templateRequest.toObject(),
          _id: new mongoose.Types.ObjectId(),
          assigned_user: user._id,
        });

        // Add current time to the request_made_timestamp:
        newRequest.request_made_timestamp = new Date();

        // Save the new request and add the ID to the user:
        await newRequest.save();

        if (!user.training_p1_annotation_requests) {
          user.training_p1_annotation_requests = [];
        }
        user.training_p1_annotation_requests.push(newRequest._id);
        await user.save();

        console.log(
          `Successfully inserted training annotation request for user id ${user._id} and article id ${newRequest.article}`
        );
      })
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports =  createTrainingRequests ;
