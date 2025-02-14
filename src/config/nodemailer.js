
const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.EMAIL,
        pass : process.env.PASSWORD
    }
});

const sendMail = async ({ to, text, subject}) => {
    try {
        const info = await transporter.sendMail({
            from : process.env.EMAIL,
            to,
            subject,
            text
        });
        console.log("Email sent ",info.response);
        return info;
    } catch(error){
        console.log("Error sending the mail: ",error);
        throw new Error(error);
    }
}

module.exports = { sendMail };