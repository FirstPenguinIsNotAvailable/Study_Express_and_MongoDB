
const express = require('express');
const { 
    getCourses    
} = require('../controllers/courses');

// this router gonna get params from other route which is bootcamp
// therefore, set mergeParams: true 
const router = express.Router({ mergeParams: true });
router.route('/').get(getCourses);

module.exports = router;