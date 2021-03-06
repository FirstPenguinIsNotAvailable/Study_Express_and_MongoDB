
const mongoose = require('mongoose');
const bcrpyt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        // * select: false
        // when we get a user through our API,
        // it's not going to actually show the password.
        select: false
    },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Encrypt password using bcrpyt
// Before saving document, we got to encrypt password using bcrpty.
UserSchema.pre('save', async function(next){
    const salt = await bcrpyt.genSalt(10);
    this.password = await bcrpyt.hash(this.password, salt);
}); 

// Sign JWT and return
// this is for encryption of id to be connceted with other routes safely
// eventually, we can decrypt the token to get id in the other routes!
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
} 

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrpyt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);