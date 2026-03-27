const mongoose = require('mongoose');

const adminDetailsSchema = new mongoose.Schema({
    adminName: String,
    adminEmail: String,
    adminPhoneNumber: Number,
    adminPassword: String
});



module.exports = mongoose.model("AdminDetails", adminDetailsSchema);