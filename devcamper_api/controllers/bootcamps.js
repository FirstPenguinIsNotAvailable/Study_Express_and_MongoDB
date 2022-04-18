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
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Get all bootcamps
// @route   Get /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude for filtering
        // i don't wanna include some commands in the document
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // query will come in this way such as /api/v1/bootcamps?averageCost[lte]=10000&housing=true
    // more preciesly, here query is averageCost[lte]=10000, housing=ture
    let queryStr = JSON.stringify(reqQuery);

    // I would like to make averageCost[lte]=10000 in the form of mongoDB operator
    // such that { averageCost: { $lte: 10000 }} but now, we got { averageCost: { lte: 10000 }}
    // therefore, somehow, we got to put $ sign in there.
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // After the code, we can find data whose averageCost is less or equal to 10000.
    // as well as we can get whose housing is true.
    query = Bootcamp.find(JSON.parse(queryStr));

    // Select Fields
    // query for selection should be just like this ?select=housing,name 
    // i should know that the form of selection of query is select('<value1> <value2>') which means
    // it's divided by white space. 
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query.select(fields);
    }
    
    // Sort
    // query for sort should be just like this ?sort=name
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    // page is showing a data from the 'page' given by query
    // limit is how many datas it's gonna show  .

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIdx = (page - 1);
    const endIdx = page;
    const total = await Bootcamp.countDocuments();

    // Basically, skip function will skip the datas up to the given value 
    query = query.skip(startIdx).limit(limit);

    const bootcamps = await query;

    // Pagination result
    const pagination = {};

    if(endIdx < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if(startIdx > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({ success: true, cout: bootcamps.length, pagination, data: bootcamps });
});

// @desc    Get single bootcamps
// @route   Get /api/v1/bootcamps/
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
    //console.log(req.body);

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

    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

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
