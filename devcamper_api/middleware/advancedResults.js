

// advancedResults is the function that helps us avoid from repetition of getting data from DB.
// it makes senses because we have probablities to create new model
const advancedResults = (model, populate) => async (req, res, next) => {
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
    query = model.find(JSON.parse(queryStr))

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
    const total = await model.countDocuments();

    // Basically, skip function will skip the datas up to the given value 
    query = query.skip(startIdx).limit(limit);

    if(populate){
        query = query.populate(populate);
    }

    const results = await query;

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


    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
} 

module.exports = advancedResults;