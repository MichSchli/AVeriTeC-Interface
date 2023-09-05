const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const loginConfig = require('../config/login_config');
const {checkAdmin, checkUserOrAdmin} = require('../middleware/authMiddleware');
const createTrainingRequests = require('../utils/createTrainingRequests');

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
    await createTrainingRequests(newUser);

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id, is_admin: newUser.is_admin }, loginConfig.jwt_secret_key, {
        expiresIn: loginConfig.token_expiration_time, // Token expiration time
    });
  
    res.status(201).json({ message: 'User registered successfully', newUser, token });
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
      const user = await UserModel.findById(userId).populate("training_p1_annotation_requests");
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      statistics = {};

      for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString();

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
        };

        // Count how many requests are done. Annotation requests are done if they have any annotation.
        statistics[stats_phase_str].annotations_done = user[user_phase_str].filter((request) => request.annotation !== undefined).length;
      }

      for (let phase = 1; phase <= 3; phase++) {
        user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString() + "_training";

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
        };

        // Count how many requests are done. Annotation requests are done if they have any annotation.
        statistics[stats_phase_str].annotations_done = user[user_phase_str].filter((request) => request.annotation !== undefined).length;
      }

  
      res.status(200).json( statistics );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  module.exports = router;
  

// Update user route (only available for admins)
router.put('/update/:userId', checkAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { username, password, is_admin, is_active } = req.body;
  
      // Check if the user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user properties
      user.username = username;
      user.is_admin = is_admin;
      user.is_active = is_active;
  
      if (password) {
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

module.exports = router;
