const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const signup = async (req, res, next) => {
    const { username, email, role } = req.body
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
            email,
            role
        }).then(user => {
            const token = jwt.sign(
                {
                    username,
                    userId: user._id,
                    role,
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
                        role: user.role,
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
            return res.status(401).json({ message: "Invalid Username or Password" })
        })
    } catch (err) {
        res.status(401).json({
            message: "Auth failed: " + err.message,
            error: err.message,
        })
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign(
            {
                username: user.username,
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h",
            }
        );
        return res.status(200).json({
            message: "Token sent to your email",
            token,
        });
    } catch (err) {
        res.status(401).json({
            message: "Auth failed: " + err.message,
            error: err.message,
        });
    }
};

const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({ _id: decodedToken.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const salt = await bcrypt.genSalt(5);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        res.status(401).json({
            message: "Reset Password failed: " + err.message,
            error: err.message,
        });
    }
};

const getProfile = async (req, res, next) => {
    const { userId } = req.user;
    try {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (err) {
        res.status(401).json({
            message: "Failed to get profile: " + err.message,
            error: err.message,
        });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    getProfile
}