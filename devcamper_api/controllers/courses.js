const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


// @desc    Get all courses
// @route   Get /api/v1/courses
// @route   Get /api/v1/bootcamps/:bootcampId/courses
// @access  Public

exports.getCourses = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId){
        const courses = Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get a course
// @route   Get /api/v1/courses/:id
// @access  Public

exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    console.log(course);

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(asyncHandler( async ( req, res, next ) => {
    req.body.bootcamp = req.params.bootcampId;
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(
            new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
            404
        );
    }

    const course = await Course.create(req.body);
    
    res.status(200).json({
        success: true,
        data: course
    });
}));


// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(asyncHandler( async ( req, res, next ) => {
    let course = await Course.findById(req.params.id);

    if(!course){
        return next(
            new ErrorResponse(`No bootcamp with the id of ${req.params.id}`),
            404
        );
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        // new: bool - if true, return the modified document rather than the original. defaults 
        // to false
        new: true,
        // we got to validate datas for update
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
}));


// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(asyncHandler( async ( req, res, next ) => {
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(
            new ErrorResponse(`No bootcamp with the id of ${req.params.id}`),
            404
        );
    }

    await course.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
}));

