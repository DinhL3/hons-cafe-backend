const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
    .connect('mongodb+srv://lqdquangdinh:CWFxJTD2YCjWnWzO@cluster0.7ac5hft.mongodb.net/hons-cafe?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });
