const jwt = require('jsonwebtoken');

const verifyJWTAuthToken = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1];
    console.log(token);
    if (!token) return res.status(401).json({ message: "Kindly login" });
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        console.log(err);
        if (err) return res.status(403).json({ message: "Unauthorized" });
        req.user = user;
        console.log(user);
        
        next();
    });
};

const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ message: "Unauthorized" });
    next();
};

module.exports = {
    verifyJWTAuthToken,
    restrictTo,
}