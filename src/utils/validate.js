
const validator = require('validator');

const validateSignUp = (req) => {
    const { firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Enter the valid name");
    } else if(firstName.length<4 && firstName.length>50){
        throw new Error("Enter the valid firstName");
    }
    if(!validator.isEmail(email)){
        throw new Error("Enter the valid email address");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Enter the strong password!");
    }
}

const validateEditData = (req) => {

    const ALLOWED_EDIT = ['firstName', 'lastName', 'email', 'photoUrl', 'about', 'age', 'gender', 'skills'];

    const isAllowed = Object.keys(req.body).every(field => ALLOWED_EDIT.includes(field));
    
    return isAllowed;
}

module.exports = {
    validateSignUp,
    validateEditData
}