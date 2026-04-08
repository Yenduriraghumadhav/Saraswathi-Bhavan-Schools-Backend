const mongoose = require("mongoose");

const adminLoginSchema = new mongoose.Schema({
    adminEmail: {
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
        default: "admin"
    },
    lastlogin: Date
});

module.exports = mongoose.model("AdminLogin", adminLoginSchema);