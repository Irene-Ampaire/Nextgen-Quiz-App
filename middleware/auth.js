const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');


const register = async (req, res, next) => {
    const { username, email } = req.body
    let { password } = req.body
    if (password.length < 4) {
        return res.status(400).json({ message: "Password less than 4 characters" })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
      }
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing fields" })
    }
    const hashPassword = async (req, res, next) => {
        if (!req.body.password) return "Password is required";
        const salt = await bcrypt.genSalt(5);
        //console.log("old: " + password);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
        
    };
    const hashedPassword = await hashPassword(req, res, next);
    try {
        await User.create({
            username,
            password : hashedPassword,
            email
        }).then(user => {
            const token = jwt.sign(
                {
                    username,
                    userId: user._id,
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h",
                }
            );
            res.status(201).json({
                message: "User successfully created",
                token,
                user,
            })
        })
    } catch (err) {
        console.log(err)
        res.status(401).json({
            message: "User not successful created " + err.message,
            err: err.mesage,
        })
    }
}

const login = async (req, res, next) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(401).json({ message: "Auth failed" })
            }
            if (result) {
                const token = jwt.sign(
                    {
                        username: user.username,
                        userId: user._id,
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h",
                    }
                )
                return res.status(200).json({
                    message: "Auth successful",
                    token,
                })
            }
            return res.status(401).json({ message: "Auth failed" })
        })
    } catch (err) {
        res.status(401).json({
            message: "Auth failed",
            error: err.message,
        })
    }
}

const verifyJWTAuthToken = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Kindly login" });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Unauthorized" });
        req.user = user;
        next();
    });
};

const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ message: "Unauthorized" });
    next();
};

module.exports = {
    register,
    login,
    verifyJWTAuthToken,
    restrictTo
}