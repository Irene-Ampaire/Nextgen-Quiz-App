const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        unique: true, // Simplified unique definition
        required: [true, 'Username is required'],
        trim: true, // Trim whitespace from the username
        minlength: [3, 'Username must be at least 3 characters long'], // Consider a minimum length for usernames
    },
    email: {
        type: String,
        unique: true, // Simplified unique definition
        required: [true, 'Email is required'],
        lowercase: true, // Store emails in lowercase for consistency
        trim: true, // Trim whitespace from the email
        validate: {
            validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v), // Basic email regex validation
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'], // Increased minimum length for better security
        required: true,
    },
    role: {
        type: String,
        enum: ['Creator', 'Participant'],
        default: 'Participant',
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

module.exports = model('User ', userSchema);