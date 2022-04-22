const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        require: [true, 'Please add a course title']
    },
    
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    
    tuition: {
        type: Number,
        required: [true, ]
    },
    
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    
    scholashipAvailable: {
        type: Boolean,
        default: false
    },
    
    createdAt: {
        type: Date, 
        default: Date.now
    },
    
    // Basically, Each courses needs to be connected with a bootcamp at least.
    // we gonna connect it with bootcamp by using id
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }
});


// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){
    /**
     * * The order of implementation for aggregate
     * => collection > $project > $match > $group > $sort > $skip > $limit > $unwind > $out
     * 
     * * Aggregation Expression Overvie
     * : $sum: add value
     *   $avg: get average of the value
     *   $min: get min
     *   $max: get max
     * 
     */

    // I think "this" here means this Model
    // therefore, we can do some operation for aggregate in speicific schema of the model.
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ]);

    // What does "this" means here in this.model('Bootcamp')
    // Answer: Model 
    // A Model is a class that's your primary tool for interacting with MongoDB. An instance of a Model is called a Document.
    try {
        await this.model('Bootcamp').findByIdAndUpdate(
            bootcampId, 
            {
                averageCost: Math.ceil(obj[0].averageCost / 10) * 10
            }, 
            { 
                runValidators: true 
            })
    } catch (err){
        console.error(err);
    }
}


// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);