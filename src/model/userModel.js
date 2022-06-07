const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 15
    },
    roles: {
        type: [String],
        required: true,
        //enum: ["CREATOR", "VIEWER", "VIEW_ALL"],
        trim: true
    }

}, { timestamps: true });

module.exports = mongoose.model('user', userSchema)