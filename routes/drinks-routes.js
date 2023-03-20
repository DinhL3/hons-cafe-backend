const express = require('express');
const drinksControllers = require('../controllers/drinks-controllers')

const router = express.Router();

router.get('/', drinksControllers.getDrinks)
router.get('/:category', drinksControllers.getDrinksByCategory)


module.exports = router;