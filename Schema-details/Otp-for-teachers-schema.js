const mongoose = require("mongoose");


const teacherotpSchema = new mongoose.Schema({
    teacherresetemail: { type: String },
    teacherresetotp: { type: String, required: true },
    createdAt: { type: Date, expires: '2m', default: Date.now }
});

module.exports = mongoose.model("teachers-otp", teacherotpSchema);