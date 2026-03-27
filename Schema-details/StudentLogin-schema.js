const mongoose = require("mongoose");

const userLoginDetailsSchema = new mongoose.Schema({
    stdemail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    role : {
        type :String,
        default: "student"
    },
    lastlogin: Date
});

module.exports = mongoose.model("UserLoginDetails", userLoginDetailsSchema);