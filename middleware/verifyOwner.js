const auth = require('basic-auth');
const { User, Course } = require('../models');

// thi middleware verifies that the user in the auth header is the owner of the course
// if verification fails, a warning is thrown and access is denied
// else: next() is called and the req is passed to the next function in the call stack (in this case, the authUser function)
exports.verifyOwner = async (req, res, next) => {
    let message;
    if (auth(req)) {
        const currentCourse = await Course.findOne({where: {id: req.params.id}});
        if (currentCourse) {
            const courseOwner = await User.findOne({where: {id: currentCourse.dataValues.userId}});
            const currentUser = await User.findOne({where: {emailAddress: auth(req).name}});
            console.log('owner id: ', courseOwner.dataValues.id);
            console.log('current user id: ', currentUser.dataValues.id);
            if (courseOwner.dataValues.id === currentUser.dataValues.id) {
                console.log('Owner verified! Passing to authorization handler...');
                next();
            } else {
                message = 'Current user is not the owner of the course';
            }
        } else {
            message = 'Course not found!';
        };

        if (message && currentCourse) {
            console.warn(message);
            res.status(403).json({message: message + ' — Access denied'});
        } else if (message && !currentCourse) {
            console.warn(message);
            res.status(400).json({message: message});
        }
    }
    else {
        next();
    }
}