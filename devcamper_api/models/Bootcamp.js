// mongoose란
// https://mongoosejs.com/docs/index.html
// https://rain2002kr.tistory.com/342
// https://velog.io/@ragnarok_code/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%A0%95%EB%A6%AC-%EB%AA%BD%EA%B5%AC%EC%8A%A4-%EC%8A%A4%ED%82%A4%EB%A7%88-%EC%A0%95%EB%A6%AC#%EB%AA%BD%EA%B5%AC%EC%8A%A4-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A0%95%EB%A6%AC
const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    // slug: 일반적으로 이미 확보된 데이터로부터 유효한 URL을 만드는 방법입니다.
    // 예를 들어, name이 meaningful 한 내용이 있다고 하면 이를 참고해서 URL을 만드는 것이다.
    // ref: https://itmining.tistory.com/119
    slug: String,
    description: {
        type: String,
        require: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },

    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },

    address: {
        type: String,
        required: [true, 'Please add an address']
    },

    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            // A 2dsphere index supports queries that calculate geometries on an earth-like sphere. 
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },

    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },

    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10'],
    },

    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {

    // when datas with query upload in the database,
    // virtuals can be converted to JSON with this code 
    // toJSON: { virtuals: true } 
    toJSON: { virtuals: true },

    // https://velog.io/@modolee/mongodb-document-to-javascript-object#plain-old-javascript-object-pojo
    // it is not the data of POJO through mongoose Query but Moogoose Document.
    // we can get only POJO type from moogoose document.
    toObject: { virtuals: true }
});

// Create bootcamp slug from the name
// Mongoose에서 pre는 어떤 action을 하기 전 단계를 의미한다.
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Geocode & create location field
BootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipCode,
        country: loc[0].countryCode
    };

    // Do not save address in DB
    this.address = undefined;

    next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
    // we can remove courses which are part of the bootcamp before deleting the bootcamp.
    console.log(`Courses being removed from bootcamp ${this._id}`)
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    // Mongoose will populate documents from the model 
    // in ref whose foreignField matches this document's localField.
    localField: '_id',
    foreignField: 'bootcamp',
    // [options.justOne=false] «boolean» by default, a populated virtual is an array. 
    // If you set justOne, the populated virtual will be a single doc or null.
    justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);