const mongoose = require("mongoose");


const otpSchema = new mongoose.Schema({
    resetemail: { type: String },
    resetotp: { type: String, required: true },
    createdAt: { type: Date, expires: '2m', default: Date.now }
});

module.exports = mongoose.model("students-otp", otpSchema);