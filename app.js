'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

// load async handler
const { asyncHandler } = require('./middleware/asyncHandler');

// import models
const { sequelize, Course, User } = require('./models');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup json parsing for request body
app.use(express.json());

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

console.log(User);

// user routes
app.get('/api/users', asyncHandler(async (req, res) => {
  console.log('searching for users...');
  const userData = await User.findAll({
    attributes: ['firstName', 'lastName', 'emailAddress', 'password'],
  });
  const userJSON = userData.map(user => user.get({plain: true}));
  res.json(userJSON)
}));

// courses routes
app.get('/api/courses', (req, res) => {
  const courseData = Course.findAll();
  res.json({data: courseData})
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// handle Sequelize operation asynchronously
console.log('Testing the connection to the database...');
(async() => {
  try {
    // test connection to database
    await sequelize.authenticate();
    console.log('Connection to database was successful!');

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync({ force: true });
  }
  catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
