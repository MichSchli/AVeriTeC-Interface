const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const loginConfig = require('../config/login_config');
const { checkAdmin, checkUserOrAdmin } = require('../middleware/authMiddleware');
const { createTrainingRequests, resetTrainingRequests } = require('../utils/trainingRequestUtils');
const getUserStatistics = require('../utils/getUserStatistics');

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
      return res.status(401).json({ message: 'Unknown username' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // If the user is not active, return an error
    if (!user.is_active) {
      return res.status(401).json({ message: 'User is inactive' });
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

    // Add all statistics together
    users.forEach((user) => {
      let user_statistics = getUserStatistics(user);

      // For all keys, if the value is a dict, recursively add the values. Otherwise, just add the values.
      Object.keys(user_statistics).forEach((key) => {
        if (typeof user_statistics[key] === 'object') {
          if (!statistics[key]) {
            statistics[key] = {};
          }
          Object.keys(user_statistics[key]).forEach((subkey) => {
            if (!statistics[key][subkey]) {
              statistics[key][subkey] = 0;
            }
            statistics[key][subkey] += user_statistics[key][subkey];
          });
        } else {
          if (!statistics[key]) {
            statistics[key] = 0;
          }
          statistics[key] += user_statistics[key];
        }
      }
      );
    });

    // Divide all keys by number of users. Also for keys where the values are dicts.
    let num_users = users.length;
    Object.keys(statistics).forEach((key) => {
      if (typeof statistics[key] === 'object') {
        Object.keys(statistics[key]).forEach((subkey) => {
          statistics[key][subkey] /= num_users;
        });
      } else {
        statistics[key] /= num_users;
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
    if (username !== undefined){
      user.username = username;
    }

    if (is_admin !== undefined){
      user.is_admin = is_admin;
    }

    if (is_active !== undefined){
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
router.get('/all', checkAdmin, async (req, res) => {
  try {
    
    // Have to use lean to get a json user object we can modify easily:
    let users = await UserModel.find().populate(populateQuery)
      .lean().exec();

    // Filter out inactivate users:
    users = users.filter((user) => user.is_active);

    // Add statistics to each user
    let updated_users = await Promise.all(
      users.map(async (user) => {
        statistics = getUserStatistics(user);
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

    await Promise.all(users.map((user) => user.save()));

    res.status(200).json({ message: 'Users updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
