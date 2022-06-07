require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const app = express();

const userModel = require("./model/userModel")
const bookModel = require("./model/bookModel")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'))

mongoose.connect(process.env.URI, {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDB is Connected!"))
    .catch(err => console.log(err))


app.listen(process.env.PORT, function () {
    console.log('Express app running on port' + (process.env.PORT))
})


/******************************************************** Middleware *********************************************************************** */
const middleware = async function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]
        if (!token) {
            return res.status(400).send({ msg: "Please enter token" })
        }
        const verifyToken = jwt.verify(token, "TheQueensEnglish")
        if (!verifyToken) {
            return res.status(401).send({ msg: "Invalid token" })
        }
        next()
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


/********************************************************for testing*********************************************************************** */
app.get('/testme', middleware, async function (req, res) {
    res.send("Hello")
})


/***************************************************** Register new User****************************************************************** */
app.post('/user', async function (req, res) {
    try {
        const data = req.body
        const resData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: resData })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
})


/********************************************************Author Login*********************************************************************** */
app.post('/login', async function (req, res) {
    try {
    const data = req.body
    const findEmailAndPassword = await userModel.findOne(data)
    console.log(findEmailAndPassword)

    if (!findEmailAndPassword) {
        return res.status(400).send({ status: false, message: 'User not found' })
    }
    const generateToken = jwt.sign({ userId: findEmailAndPassword._id }, "TheQueensEnglish")
    res.header('x-api-key', generateToken)
    return res.status(200).send({ status: true, message: "User login successfully", data: generateToken })
}catch (err) {
    return res.status(500).send({ status: false, error: err.message })
}
})


/******************************************************Creating book************************************************************************ */
app.post('/books', middleware, async function (req, res) {
    try {
        const data = req.body
        const user = await userModel.findById({ _id: req.body.userId })
        if (!user) {
            return res.status(404).send({ status: false, message: 'User not exist' })
        }
        else {
            if (user.roles.includes("CREATOR")) {
                const bookData = await bookModel.create(data)
                return res.status(201).send({ status: true, message: "Book created successfully", data: bookData })
            }
            else {
                return res.status(403).send({ status: false, message: "User not authorized"})
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })

    }
})


/*********************************************Fetch book for Viewer, View All, Old & New books ********************************************* */
app.get('/books', async function (req, res) {
    try {
        const data = req.query
        const key = Object.keys(data)
        let query = {}
        if (key.length == 1) {
            //check for Old books
            if (key == "old") {
                query.createdAt = { $lte: new Date().getTime() - (60 * 60 * 1000) }
            }
            //check for New books
            else {
                query.createdAt = { $gte: new Date().getTime() - (60 * 60 * 1000) }
            }
            const bookResponse = await bookModel.find(query).sort({ title: -1 })

            if (bookResponse.length == 0) {
                return res.status(404).send({ status: false, message: " book does not exist " })
            }
            return res.status(200).send({ status: true, message: "All book are found", count: bookResponse.length, data: bookResponse })
        }
        else {
            //fetch book for specific Viewer (Viewer role)
            const data = req.body
            const key = Object.keys(data)
            if (key.length == 1) {
                data.createdAt = { $gte: new Date().getTime() - (60 * 60 * 1000) }
                let bookDetails = await bookModel.findOne(data)
                if (!bookDetails) {
                    return res.status(404).send({ status: false, message: " book does not exist " })
                }
                return res.status(200).send({ status: true, message: "Viewer find the book", data: bookDetails })

            } else {
                //fetch all book (View all role)
                const bookDetails = await bookModel.find({
                    createdAt: { $lte: new Date().getTime() - (60 * 60 * 1000) }
                }).sort({ title: -1 })

                if (bookDetails.length == 0) {
                    return res.status(404).send({ status: false, message: " book does not exist " })
                }
                return res.status(200).send({ status: true, message: "All book are found", count: bookDetails.length, data: bookDetails })
            }
        }
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
})


/****************************************************************XXXXX****************************************************************** */