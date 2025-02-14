
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: {
        type: String,
        required: true,
        length: 6
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;