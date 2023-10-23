// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const annotationRoutes = require('./routes/annotationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { url, options } = require('./config/mongodb_config');

console.log("Connecting to MongoDB at " + url);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to log request information
const logRequestInfo = (req, res, next) => {
  const { method, originalUrl, ip } = req;
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} from ${ip}`);
  next();
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(logRequestInfo); // Add this middleware to log request information

// Connect to MongoDB
mongoose.connect(url, options);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// API routes
app.use('/users', userRoutes);
app.use('/annotations', annotationRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/search', searchRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});