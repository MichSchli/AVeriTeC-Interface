const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const loginConfig = require('../config/login_config');
const { checkAdmin, checkUserOrAdmin } = require('../middleware/authMiddleware');
const { createTrainingRequests, resetTrainingRequests } = require('../utils/trainingRequestUtils');
const getUserStatistics = require('../utils/getUserStatistics');

const P1AnnotationRequestModel = require('../model/annotationRequests/p1AnnotationRequestModel');
const P2AnnotationRequestModel = require('../model/annotationRequests/p2AnnotationRequestModel');
const P3AnnotationRequestModel = require('../model/annotationRequests/p3AnnotationRequestModel');
const P4AnnotationRequestModel = require('../model/annotationRequests/p4AnnotationRequestModel');
const P5AnnotationRequestModel = require('../model/annotationRequests/p5AnnotationRequestModel');

// Query to populate a user:
const populateQuery = [
  {
    path: "p1_annotation_requests",
    populate: {
      path: "annotation",
      model: "ClaimNormAnnotation"
    }
  },
  {
    path: "training_p1_annotation_requests",
    populate: {
      path: "annotation",
      model: "ClaimNormAnnotation"
    }
  },
  {
    path: "p2_annotation_requests",
    populate: {
      path: "annotation",
      model: "QuestionAnnotation"
    }
  },
  {
    path: "training_p2_annotation_requests",
    populate: {
      path: "annotation",
      model: "QuestionAnnotation"
    }
  },
  {
    path: "p3_annotation_requests",
    populate: {
      path: "annotation",
      model: "ControlAnnotation"
    }
  },
  {
    path: "training_p3_annotation_requests",
    populate: {
      path: "annotation",
      model: "ControlAnnotation"
    }
  },
  {
    path: "p4_annotation_requests",
    populate: {
      path: "annotation",
      model: "QuestionAnnotation"
    }
  },
  {
    path: "p5_annotation_requests",
    populate: {
      path: "annotation",
      model: "ControlAnnotation"
    }
  }
];

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new UserModel({
      username,
      passwordHash,
      is_admin: false,
      is_active: true,
    });

    await newUser.save();

    // Create training requests for the new user
    await createTrainingRequests(newUser, 1);
    await createTrainingRequests(newUser, 2);
    await createTrainingRequests(newUser, 3);

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id, is_admin: newUser.is_admin }, loginConfig.jwt_secret_key, {
      expiresIn: loginConfig.token_expiration_time, // Token expiration time
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: Unknown username' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed: Wrong password' });
    }

    // If the user is not active, return an error
    if (!user.is_active) {
      return res.status(401).json({ message: 'Authentication failed: User is inactive' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, is_admin: user.is_admin }, loginConfig.jwt_secret_key, {
      expiresIn: loginConfig.token_expiration_time, // Token expiration time
    });

    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password route
router.post('/change_password', async (req, res) => {
  try {
    const { username, password, newPassword } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and update the new password
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Statistics route (accessible to the user or admin)
router.get('/statistics/:user_id', checkUserOrAdmin, async (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = await UserModel.findById(userId)
      .populate(populateQuery);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    statistics = getUserStatistics(user);

    res.status(200).json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Getter route for a single user (accessible to the user or admin)
router.get('/get/:user_id', checkUserOrAdmin, async (req, res) => {
  try {
    const userId = req.params.user_id;
    let user = await UserModel.findById(userId).populate(populateQuery).lean().exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    statistics = getUserStatistics(user);
    user.statistics = statistics;

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Statistics route that averages all fields (accessible to admin only)
router.get('/average_statistics', checkAdmin, async (req, res) => {
  try {
    const users = await UserModel.find().populate(populateQuery).lean().exec();

    let statistics = {};
    let counters = {};

    // Add all statistics together
    users.forEach((user) => {
      let user_statistics = getUserStatistics(user);

      Object.keys(user_statistics).forEach((key) => {
        // For all keys starting with "phase_", the value is a dict
        // Recursively add according to special rules
        if (key.startsWith("phase_")) {
          if (!statistics[key]) {
            statistics[key] = {};
            counters[key] = {};
          }
          Object.keys(user_statistics[key]).forEach((subkey) => {
            if (!statistics[key][subkey]) {
              statistics[key][subkey] = 0;
              counters[key][subkey] = 0;
            }

            // For annotations_done, annotations_assigned, and annotations_per_hour, add the values if assigned > 0:
            if (subkey == "annotations_done" || subkey == "annotations_assigned" || subkey == "annotations_per_hour") {
              if (user_statistics[key][subkey] > 0) {
                statistics[key][subkey] += user_statistics[key][subkey];
                counters[key][subkey] += 1;
              }
            }

            // For timekeeping values and questions, add the values if done > 0:
            else if (subkey == "average_task_time" || subkey == "average_load_time" || subkey == "average_questions") {
              if (user_statistics[key]["annotations_done"] > 0) {
                statistics[key][subkey] += user_statistics[key][subkey];
                counters[key][subkey] += 1;
              }
            }
          });
        }

        // For all other keys, add the values if they are not undefined:
        else {
          if (user_statistics[key] !== undefined) {
            if (!statistics[key]) {
              statistics[key] = 0;
              counters[key] = 0;
            }
            statistics[key] += user_statistics[key];
            counters[key] += 1;
          }
        }
      });
    });

    // Divide statistics by counters
    Object.keys(statistics).forEach((key) => {
      if (key.startsWith("phase_")) {
        Object.keys(statistics[key]).forEach((subkey) => {
          statistics[key][subkey] /= counters[key][subkey];
        });
      }
      else {
        statistics[key] /= counters[key];
      }
    });


    res.status(200).json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update user route (only available for admins)
router.post('/update/:userId', checkAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, password, is_admin, is_active } = req.body;

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user properties
    if (username !== undefined) {
      user.username = username;
    }

    if (is_admin !== undefined) {
      user.is_admin = is_admin;
    }

    if (is_active !== undefined) {
      user.is_active = is_active;
    }

    if (password !== undefined) {
      // Hash and update the password if provided
      const saltRounds = 10;
      user.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all user statistics route (only available for admins)
router.post('/all', checkAdmin, async (req, res) => {
  try {
    var { stats_date_cutoff, stats_upper_date_cutoff } = req.body;
    if (stats_date_cutoff) {
      stats_date_cutoff = new Date(stats_date_cutoff);
    }
    if (stats_upper_date_cutoff) {
      stats_upper_date_cutoff = new Date(stats_upper_date_cutoff);
    }

    console.log("Getting all user statistics between " + stats_date_cutoff + " and " + stats_upper_date_cutoff)

    // Have to use lean to get a json user object we can modify easily:
    let users = await UserModel.find().populate(populateQuery)
      .lean().exec();

    // Filter out inactivate users:
    users = users.filter((user) => user.is_active);

    // Add statistics to each user
    let updated_users = await Promise.all(
      users.map(async (user) => {
        statistics = getUserStatistics(user, stats_date_cutoff, stats_upper_date_cutoff);
        return { ...user, statistics: statistics };
      })
    );

    res.status(200).json({ users: updated_users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set multiple users to inactive (only available for admins)
router.post('/deactivate_many', checkAdmin, async (req, res) => {
  try {
    const { user_ids } = req.body;

    // Check if the user exists
    const users = await UserModel.find({ _id: { $in: user_ids } });
    if (!users) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user properties
    users.forEach((user) => {
      user.is_active = false;
    });

    // Unassign all requests from those users, so long as no annotation was submitted
    for (let user_i = 0; user_i < users.length; user_i++) {
      let user = users[user_i];
      for (let i = 1; i <= 5; i++) {
        let annotationRequestModel;
        switch (parseInt(i)) {
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

        let user_assignment_field = "p" + i.toString() + "_annotation_requests";

        let new_request_ids = [];
        let request_ids = user[user_assignment_field];
        let requests = await annotationRequestModel.find({ _id: { $in: request_ids } }).exec();

        for (let j = 0; j < requests.length; j++) {
          let request = requests[j];
          if (!request.annotation) {
            request.assigned_user = undefined;
            await request.save();
          } else {
            new_request_ids.push(request._id);
          }
        }

        user[user_assignment_field] = new_request_ids;
        console.log("Deleted requests from user " + user.username + " for phase " + i.toString());
        console.log("I kept " + new_request_ids.length.toString() + " requests as they had annotations submitted");
      }
    }

    await Promise.all(users.map((user) => user.save()));

    res.status(200).json({ message: 'Users updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
