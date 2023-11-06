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
const loginConfig = require('../config/login_config');
const { checkAdmin, checkUserOrAdmin, checkUserIsAssigned } = require('../middleware/authMiddleware');

// Route to assign N annotation requests to user ids in a specified list
router.post('/assign_to_list', checkAdmin, async (req, res) => {
    try {
        const { user_ids, phase, assignments_per_user } = req.body;

        console.log("Assigning " + assignments_per_user.toString() + " annotation requests for phase " + phase.toString() + " to users: " + user_ids.toString());

        if (!user_ids) {
            return res.status(400).json({ message: 'User IDs are missing' });
        }

        if (!phase) {
            return res.status(400).json({ message: 'Phase is missing' });
        }

        if (!assignments_per_user) {
            return res.status(400).json({ message: 'Number of annotation requests is missing' });
        }

        let annotationRequestModel;

        switch (parseInt(phase)) {
            case 1:
                annotationRequestModel = P1AnnotationRequestModel;
                break;
            case 2:
                annotationRequestModel = P2AnnotationRequestModel;
                break;
            case 3:
                annotationRequestModel = P3AnnotationRequestModel;
                break;
            case 4:
                annotationRequestModel = P4AnnotationRequestModel;
                break;
            case 5:
                annotationRequestModel = P5AnnotationRequestModel;
                break;
            default:
                return res.status(400).json({ message: 'Invalid phase (' + phase.toString() + ')' });
        }

        // Find N annotation requests for each user that are not assigned to anyone
        let annotationRequests = await annotationRequestModel.find({ assigned_user: null }).limit(assignments_per_user * user_ids.length).exec();

        // Keep track of how many requests we have assigned to each user. Initialize to 0.
        let user_counts = {};
        user_ids.forEach(user_id => {
            user_counts[user_id] = 0;
        });

        // Retrieve all the users from the database based on their ids:
        let users = await UserModel.find({ _id: { $in: user_ids } }).exec();
        let user_assignment_field = "p" + phase.toString() + "_annotation_requests";


        // For each request, attempt to find a user whose id is not in the blocked_user_ids list, and who does not yet have N requests assigned to them
        // Assign to that user
        for (let j = 0; j < annotationRequests.length; j++) {
            annotationRequest = annotationRequests[j];
            // Shuffle the users so we go in random order. This helps distribute requests somewhat evenly:
            users.sort(() => Math.random() - 0.5);

            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                if (!annotationRequest.blocked_user_ids.includes(user._id) && user_counts[user._id] < assignments_per_user) {
                    // Update the annotation request
                    annotationRequest.assigned_user = user._id;
                    await annotationRequest.save();

                    // Update the user's annotation requests
                    user[user_assignment_field].push(annotationRequest._id);
                    user_counts[user._id] += 1;
                    await user.save();

                    console.log("Assigned request " + annotationRequest._id.toString() + " to user " + user.username.toString());

                    break;
                }
            }
        }

        // Find any unassigned requests in annotationRequests:
        let unassigned_requests = annotationRequests.filter((request) => request.assigned_user === null);
        let user_message = unassigned_requests.length > 0 ? "Assignment complete. Warning: " + unassigned_requests.length.toString() + " requests were not assigned, as some included users have handled these in previous phases. Please try again." : "Assignment complete. All requests were assigned.";
        return res.status(200).json({ message: user_message, unassigned_requests: unassigned_requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to remove N annotation requests from user ids in a specified list
router.post('/unassign_from_list', checkAdmin, async (req, res) => {
    try {
        const { user_ids, phase, assignments_per_user } = req.body;

        console.log("Assigning " + assignments_per_user.toString() + " annotation requests for phase " + phase.toString() + " to users: " + user_ids.toString());

        if (!user_ids) {
            return res.status(400).json({ message: 'User IDs are missing' });
        }

        if (!phase) {
            return res.status(400).json({ message: 'Phase is missing' });
        }

        if (!assignments_per_user) {
            return res.status(400).json({ message: 'Number of annotation requests is missing' });
        }

        let annotationRequestModel;

        switch (parseInt(phase)) {
            case 1:
                annotationRequestModel = P1AnnotationRequestModel;
                break;
            case 2:
                annotationRequestModel = P2AnnotationRequestModel;
                break;
            case 3:
                annotationRequestModel = P3AnnotationRequestModel;
                break;
            case 4:
                annotationRequestModel = P4AnnotationRequestModel;
                break;
            case 5:
                annotationRequestModel = P5AnnotationRequestModel;
                break;
            default:
                return res.status(400).json({ message: 'Invalid phase (' + phase.toString() + ')' });
        }

        // Retrieve all the users from the database based on their ids:
        let users = await UserModel.find({ _id: { $in: user_ids } }).exec();
        let user_assignment_field = "p" + phase.toString() + "_annotation_requests";

        // For each user, find up to N annotation requests assigned to them, with no submitted annotation
        // Set the assigned user for those to undefined
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            
            let request_ids = user[user_assignment_field];
            let requests = await annotationRequestModel.find({ _id: { $in: request_ids } }).exec();

            let new_requests = [];
            let counter = 0;

            for (let j = 0; j < requests.length; j++) {
                let request = requests[j];
                if (!request.annotation && counter < assignments_per_user) {
                    request.assigned_user = undefined;
                    await request.save();
                    counter += 1;
                } else {
                    new_requests.push(request);
                }
            }

            user[user_assignment_field] = new_requests.map((request) => request._id);
            await user.save();

            console.log("Unassigned requests for user " + user.username.toString());
        }

        return res.status(200).json({ message: "Unassignment complete." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;