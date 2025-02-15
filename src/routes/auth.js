
const express = require('express');
const { validateSignUp } = require('../utils/validate');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const authRouter = express.Router();
const validator = require('validator');
const { sendMail } = require("../config/nodemailer");
const crypto = require('crypto');
const Otp = require("../models/otp");

authRouter.post('/signup', async (req, res) => {
    try {

        validateSignUp(req);

        const { firstName, lastName, email, password} = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User({
            firstName,
            lastName,
            email,
            password : passwordHash
        });

        await user.save();
        const token = await user.getJWT();
        res.cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000) });
        res.json({message: "user registered sucessfully", data: user});

    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password} = req.body;

        if(!email) {
            throw new Error("enter the email");
        }

        if(!validator.isEmail(email)) {
            throw new Error("Invalid email");
        }

        const user = await User.findOne({email});
        
        if(!user) {
            throw new Error("Invalid credentials");
        }

        const isValidPassword = await user.validatePassword( password );

        if(!isValidPassword) {
            throw new Error("Invalid credentials");

        } else {

            const token = await user.getJWT();

            res.cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000) });

            res.send(user);
        }
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, {
        expires : new Date(Date.now())
    });
    res.send('logout sucessfully!');
})

authRouter.post("/forgot-password", async (req,res) => {
    const { email } = req.body;
    if(!validator.isEmail(email)){
        return res.status(404).json({ message: "Invalid email"});
    }
    const user = await User.findOne({email});
    if(!user) {
        return res.status(404).json({message: "User not found. Please Signup!"});
    }
    const otpGen = crypto.randomInt(1000,9999);

    await Otp.deleteMany({ userId: user._id, expiresAt: { $gte: Date.now() }, isUsed: false });
    const otp = new Otp({userId: user._id,otp: otpGen,expiresAt: new Date(Date.now()+10*60*1000)});
    await otp.save();
    try {
        await sendMail({
            to: email,
            subject: "Password Reset OTP for DevTinder",
            text: `Your OTP is ${otpGen}. It is valid for 10 minutes.`,
          });
        res.status(200).send({message: "opt sent!"});
    } catch(error){
        res.status(500).json({ error: "Failed to send otp"});
    }
});

authRouter.post('/verify-otp', async (req,res) => {
    try {
        const { otp, email} = req.body;
        if(!otp){
            return res.status(404).json({ message: "Invalid otp"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ message: "User not found. Please Signup"});
        }
        const otpFromDataBase = await Otp.findOne({ userId: user._id});
        if(!otpFromDataBase || otpFromDataBase.otp!==otp || otpFromDataBase.isUsed){
            return res.status(404).json({ message: "Invalid otp. Please try again!"});
        }
        res.status(200).json({ message: "otp validated sucessfully."});
    } catch(error){
        res.status(500).json({ error: "Invalid otp"});
    }
})

authRouter.patch("/reset-password", async (req,res) => {
    try {
        const { email, password, otp} = req.body;
        if(!validator.isEmail(email)){
            return res.status(404).json({ message: "Invalid email"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ message: "User not found. Please Signup"});
        }
        const otpFromDataBase = await Otp.findOne({userId: user._id});
        if(!otpFromDataBase || otpFromDataBase.otp!==otp || otpFromDataBase.isUsed){
            return res.status(404).json({ message: "Invalid otp. Please try again!"});
        }
        if (new Date() > otpFromDataBase.expiresAt) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
        const isPrevPassword = await user.validatePassword(password);
        if(isPrevPassword){
            return res.status(404).json({ message: "please enter a new password that is different from the previous password."});
        }
        if(!validator.isStrongPassword(password)){
            return res.status(404).json({ message: "Enter Strong Password"});
        }
        otpFromDataBase.isUsed = true;
        
        await otpFromDataBase.save();
        const passwordHash = await bcrypt.hash(password, 10);
        user.password = passwordHash;

        await user.save();

        res.status(200).json({ message: "Password updated successfully."})
    } catch(error) {
        res.status(500).json({ error: "Failed to update password. try again!"});
    }
})

module.exports = authRouter;