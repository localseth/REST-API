'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/asyncHandler');
const models = require('./models');
const { User, Course } = models;
const { authenticateUser } = require('./middleware/authUser');

// Construct a router instance.
const router = express.Router();

// user routes
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    console.log('searching for user...');
    const user = req.currentUser;
    res.json(user);
}));

router.post('/users', authenticateUser, asyncHandler(async (req, res) => {
    console.log('creating new user');
    await User.create(req.body);
    res.set('Location', '/')
        .status(201)
        .end();
}))
  
// courses routes
router.get('/courses', asyncHandler(async (req, res) => {
    const courseData = await Course.findAll({
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName'], 
                as: 'user'
            }
        ]
    });
    res.json(courseData);
}));

router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName'],
                as: 'user'
            }
        ]
    });
    res.json(course);
}));

router.post('/courses', asyncHandler(async (req, res) => {
    console.log('Creating new course...');
    const newCourse = await Course.create(req.body);
    res.set('Location', `/courses/${newCourse.id}`)
        .status(201)
        .end();
}));

router.put('/courses/:id', asyncHandler(async (req, res) => {
    console.log('Updating course ' + req.params.id + '...');
    await Course.update( req.body,
        {
            where: {id: req.params.id}
        }
    );
    console.log('Course has been updated');
    res.status(204).end();
}));

router.delete('/courses/:id', asyncHandler(async (req, res) => {
    console.log('Deleting course ' + req.params.id + '...');
    await Course.destroy({ where: { id: req.params.id } });
    res.status(204).end();
}))

module.exports = router;