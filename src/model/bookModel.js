const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique : true,
        trim : true
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    ISBN: {
        type: String,
        required: true,
        trim : true
    },
    category: {
        type: String,
        required: true,
        trim : true
    },
    isPublished : {
        type : Date,
        required : true,
        default : Date.now(),
        trim : true
    },
    
}, { timestamps: true })

module.exports = mongoose.model('book', bookSchema)