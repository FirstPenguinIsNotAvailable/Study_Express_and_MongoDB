/**
 * https://cotak.tistory.com/85
 */

const express = require('express');
const { 
    getBootcamps,
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampsInRadius,
    uploadBootcampPhoto 
} = require('../controllers/bootcamps');


const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');


// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const { protect } = require('../middleware/auth');


// Re-route into other resource routers
//
// This code is supposed to be implementation for course route
// when we got query such as "/api/v1/bootcamps"
// eventually, we can implement /api/v1/bootcamps/:bootcampId/courses here.
router.use('/:bootcampId/courses', courseRouter);

router.route('/:id/photo').put(protect, uploadBootcampPhoto);


router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    // router.METHOD(path, [callback, ...] callback)
    // basically, after executing protect, run createBootcamp
    .post(protect, createBootcamp)

router.route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

module.exports = router;