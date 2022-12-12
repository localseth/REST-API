'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/asyncHandler');
const models = require('./models');
const { User, Course } = models;
const auth = require('basic-auth');
const { authenticateUser } = require('./middleware/authUser');
const { verifyOwner } = require('./middleware/verifyOwner');

// Construct a router instance.
const router = express.Router();

// USER ROUTES
// get current user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const credentials = auth(req);
    console.log('searching for user...', credentials.name);
    const user = await User.findOne({
        where: {
            emailAddress: credentials.name
        },
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        },
    });
    res.json(user);
}));

// create a new user
router.post('/users', asyncHandler(async (req, res) => {
    console.log('creating new user');
    await User.create(req.body);
    res.set('Location', '/')
        .status(201)
        .end();
}))
  
// COURESE ROUTES
// get list of courses
router.get('/courses', asyncHandler(async (req, res) => {
    const courseData = await Course.findAll({
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName', 'emailAddress'], 
                as: 'owner'
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
    });
    res.json(courseData);
}));

// get course identified in request parameters
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName', 'emailAddress'],
                as: 'owner'
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
    });
    if(course){
        res.json(course);
    } else {
        res.json({message: 'Course not found for ID: ' + req.params.id});
    }
}));

// create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    console.log('Creating new course...');
    const newCourse = await Course.create(req.body);
    res.set('Location', `/courses/${newCourse.id}`)
        .status(201)
        .end();
}));

// update a course (must be verified and authenticated)
router.put('/courses/:id', verifyOwner, authenticateUser, asyncHandler(async (req, res) => {
    console.log('Updating course ' + req.params.id + '...');
    const course = await Course.findByPk(req.params.id);
    await course.update( req.body );
    console.log('Course has been updated');
    res.status(204).end();
}));

// delete a course (must be verified and authenticated)
router.delete('/courses/:id', verifyOwner, authenticateUser, asyncHandler(async (req, res) => {
    const testCourse = await Course.findAll({where:{id: req.params.id}, limit: 1});
    console.log('course exists: ', (testCourse ? 'true' : 'false'));
    if (testCourse[0]) {
        console.log('Deleting course ' + req.params.id + '...');
        await Course.destroy({ where: { id: req.params.id } });
        res.status(204).end();
    } else {
        res.status(400).json({message: 'course not found'}).end()
    };
    
}))

module.exports = router;