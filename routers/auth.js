const route = require('express').Router();
const { signup, login, forgotPassword, resetPassword, getProfile } = require('../controllers/auth');
const { verifyJWTAuthToken } = require('../middleware/auth');

route.post('/signup', signup);
route.post('/login', login);
route.post('/forgot-password', forgotPassword);
route.post('/reset-password', resetPassword);
route.get('/me', verifyJWTAuthToken, getProfile);

module.exports = route;