require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
const morgan = require("morgan");

const drinksRoutes = require('./routes/drinks-routes');
const usersRoutes = require('./routes/users-routes');
const cartRoutes = require('./routes/cart-routes');
const ordersRoutes = require('./routes/orders-routes');



const HttpError = require('./models/http-error');

const app = express();

app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(cors());

app.use('/api/drinks', drinksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes)

app.get('/', (req, res) => {
    res.send('Hons Cafe Backend is working!');
});

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
    .connect(`mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.7ac5hft.mongodb.net/hons-cafe?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server started and listening on port ${process.env.PORT || 5000}`);
        });
        console.log(`MongoDB database connection established successfully!`);
    })
    .catch(err => {
        console.log(err);
    });