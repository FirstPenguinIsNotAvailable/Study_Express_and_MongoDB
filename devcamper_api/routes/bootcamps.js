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
    getBootcampsInRadius } = require('../controllers/bootcamps');


// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route into other resource routers
//
// This code is supposed to be implementation for course route
// when we got query such as "/api/v1/bootcamps"
// eventually, we can implement /api/v1/bootcamps/:bootcampId/courses here.
router.use('/:bootcampId/courses', courseRouter);

router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

module.exports = router;