
const express = require('express');
const { 
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

// this router gonna get params from other route which is bootcamp
// therefore, set mergeParams: true 
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getCourses)
    .post(addCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);


module.exports = router;