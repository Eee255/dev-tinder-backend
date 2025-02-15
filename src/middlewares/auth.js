
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        
        if(!token) {
            return res.status(401).send("please login!");
        }

        const decodedObj = await jwt.verify( token, '171Bhanu');
        
        const user = await User.findById( decodedObj._id );

        if(!user){
            throw new Error('user not found!');
        }

        req.user = user;
        next();

    } catch (err) {
        res.status(400).send("Error : " + err.message);
    }
};

module.exports = {
    userAuth,
}