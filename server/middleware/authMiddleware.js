const jwt = require('jsonwebtoken');
const loginConfig = require('../config/login_config');
const UserModel = require('../model/userModel');

// Middleware to verify JWT token and check admin status
const checkAdmin = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, loginConfig.jwt_secret_key); // Use the secret key from login_config

    if (!decoded.userId || !decoded.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add user information to the request for further processing
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid' });
  }
};


// Middleware to check if the token corresponds to the user ID or if the user is an admin
const checkUserOrAdmin = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, loginConfig.jwt_secret_key); // Use the secret key from login_config

    if (!decoded.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if the user is an admin
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    if (decoded.isAdmin || decoded.userId === req.params.user_id) {
      req.userId = decoded.userId;
      req.isAdmin = decoded.isAdmin;
      next();
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Middleware to check if the token corresponds to the user ID assigned to the annotation request
const checkUserIsAssigned = async (req, res, next) => {
  const token = req.header('Authorization');
  const { annotation_request, dataset, phase } = req.body;

  console.log("Verifying user is assigned to annotation request " + annotation_request._id);

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  if (!annotation_request) {
    return res.status(400).json({ message: 'Annotation request is missing' });
  }

  try {
    const decoded = jwt.verify(token, loginConfig.jwt_secret_key); // Use the secret key from login_config

    if (!decoded.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    if (dataset === 'annotation') {
      let user_phase_str = "p" + phase.toString() + "_annotation_requests";
      if (!user[user_phase_str].includes(annotation_request._id)) {
        return res.status(403).json({ message: 'User is not assigned to this annotation request' });
      }
    } else if (dataset === 'training') {
      let user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
      if (!user[user_phase_str].includes(annotation_request._id)) {
        return res.status(403).json({ message: 'User is not assigned to this annotation request' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid dataset type' });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};


module.exports = { checkUserOrAdmin, checkAdmin, checkUserIsAssigned };

