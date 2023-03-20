const express = require('express');

const router = express.Router();

router.get('/hot', drinksControllers.getHotDrinks)

module.exports = router;