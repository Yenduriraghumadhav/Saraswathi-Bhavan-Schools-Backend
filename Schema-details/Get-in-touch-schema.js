const mongoose = require("mongoose");

const GetInTouchSchema = new mongoose.Schema({
    supportName: {
        type: String
    },
    supportEmail: {
        type: String
    },
    supportMobileNumber: {
        type: Number 
    }
});

module.exports = mongoose.model("getInTouchTable", GetInTouchSchema);