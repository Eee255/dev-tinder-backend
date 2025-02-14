
const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditData } = require('../utils/validate');
const profileRouter = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');

profileRouter.get('/profile/view', userAuth , async (req, res) => {
    try {

        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const isValid = validateEditData(req);
        if(!isValid) {
            throw new Error('Access denied!');
        } else {
            const loggedUser = req.user;

            Object.keys(req.body).forEach((key) => loggedUser[key] = req.body[key]);

            await loggedUser.save();

            res.json({ message : `${loggedUser.firstName}, profile updated successfully!`, Data : loggedUser});
        }
    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

profileRouter.patch('/profile/password', userAuth , async (req, res) => {
    try {
        const { password } = req.body;
        const user = req.user;

        if(!password) {
            throw new Error('Enter the password');
        }
        const prevPassword = await bcrypt.compare(password, user.password);
        
        if(prevPassword) {
            throw new Error('please enter a new password that is different from the previous password.')
        }

        if(!validator.isStrongPassword(password)) {

            throw new Error('Enter the strong password!');

        } else {

            const passwordHash = await bcrypt.hash(password, 10);

            user.password = passwordHash;

            await user.save();

            res.cookie('token', null, {
                expires : new Date(Date.now())
            });

            res.json({ message : "password changed sucessfully. please login!"});
        }
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
})

module.exports = profileRouter;