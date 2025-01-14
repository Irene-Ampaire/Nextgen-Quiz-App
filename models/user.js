const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        unique: [true, 'Username already exists'],
        required: [true, 'Username is required']
    },
    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        minlength: [4, 'Password must be at least 4 characters long'],
        required: true
    },
    role: {
        type: String,
        enum: ['Creator', 'Participant'],
        default: 'Participant'
        
    }
}, {
    timestamps: true
});

module.exports = model('User', userSchema);