const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.post(
    '/register',
    [
        check('userName')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail()
    ],
    usersController.register
);

router.post('/login', usersController.login);

module.exports = router;
