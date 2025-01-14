const route = require('express').Router();
const User = require('../models/user');
const { register, login } = require('../middleware/auth');

route.post('/register', register);
route.post('/login', login);

module.exports = route;