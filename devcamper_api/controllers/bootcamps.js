/**
 * GET 은 클라이언트에서 서버로 어떠한 리소스로 부터 정보를 요청하기 위해 사용되는 메서드이다. 
 * GET을 통한 요청은 URL 주소 끝에 파라미터로 포함되어 전송되며, 이 부분을 쿼리 스트링 (query string) 이라고 부른다.
 * 
 * 방식은 URL 끝에 " ? " 를 붙이고 그다음 변수명1=값1&변수명2=값2... 형식으로 이어 붙이면 된다.
 * 
 * 예를들어 다음과 같은 방식이다. 
 * 
 * EX) www.example.com/show?name1=value1&name2=value2]
 * 
 * GET 특징
 * 
 * 1. GET 요청은 캐시가 가능하다. 
 : GET을 통해 서버에 리소스를 요청할 때 웹 캐시가 요청을 가로채 서버로부터 리소스를 다시 다운로드하는 대신 리소스의 복사본을 반환한다. 
HTTP 헤더에서 cache-control 헤더를 통해 캐시 옵션을 지정할 수 있다.
 
    2. GET 요청은 브라우저 히스토리에 남는다.
    3. GET 요청은 북마크 될 수 있다.
    4. GET 요청은 길이 제한이 있다.
    : GET 요청의 길이 제한은 표준이 따로 있는건 아니고 브라우저마다 제한이 다르다고 한다. 

    5. GET 요청은 중요한 정보를 다루면 안된다. ( 보안 )
    : GET 요청은 파라미터에 다 노출되어 버리기 때문에 최소한의 보안 의식이라 생각하자. 
 */

const Bootcamp = require('../models/Bootcamp');
 
const geocoder = require('../utils/geocoder');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');



// @desc    Get all bootcamps
// @route   Get /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    //res.status(200).json({ success: true, msg: `Get bootcamp ${req.params.id}` });
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: bootcamp });

});

/**
 * POST
 * 
 * POST는 리소스의 생성을 담당한다.
 * POST는 요청 시 마다, 새로운 리소스가 생성된다.
 * 
 * POST 요청은 캐시되지 않는다.
 * POST 요청은 브라우저 히스토리에 남지 않는다.
 * POST 요청은 북마크 되지 않는다.
 * 
 * POST 요청은 데이터 길이에 제한이 없다.
 * 
 */

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private 
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // res.status(200).json({ success: true, msg: 'Create new bootcamp' });
    
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(
            `The user with ID ${req.user.id} has already pushlished a bootcamp`, 
            400)
        );
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

/**
 * PUT
 * 
 * PUT은 리소스의 생성과 수정을 담당한다.
 * PUT은 요청 시 마다, 같은 리소스를 반환한다
 * 물론, 리소스 안에 속성은 변경될 수 있다.
 */

// @desc    Update new bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private 
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    //res.status(200).json({ success: true, msg: `Update bootcamp ${req.params.id}` });
    const bootcamp = await Bootcamp.findById(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete new bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private 
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    //res.status(200).json({ success: true, msg: `Delete bootcamp ${req.params.id}` });

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    bootcamp.remove();

    res.status(200).json({ success: true, data: req.body });

});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private 
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculus radius using radians

    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km

    const radius = distance / 6378;

    // Code below is finding some datas from DB based on the command 
    // that is already given by mongoose
    // https://www.mongodb.com/docs/manual/reference/operator/query/geoWithin/
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ]}}
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private 
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    // We can upload files by using 'express-fileupload easily'
    // when we install it, we can automatically use req.files which we passed in query.
    // req.files looks like files = { file: [{}, {}] }
    console.log(req.files);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    if(!req.files){
        return next(
            new ErrorResponse(`Please upload a file`, 404)
        );
    }

    const file = req.files.file;

    // Make sure the image is a photo
    // mimetype is the type of file
    if(!file.mimetype.startsWith("image")){
        return next(
            new ErrorResponse(`Please upload an image file`, 400)
        );
    }

    // Check filesized
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
        );
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    console.log(file);

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next(
                new ErrorResponse(`Problem with file upload`, 500)
            );
        }

        //await Bootcamp.findById(req.param.id, { photo: file });
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name }, { runValidators: true })
        
        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});
