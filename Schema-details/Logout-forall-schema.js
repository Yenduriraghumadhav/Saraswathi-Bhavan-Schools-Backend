const mongoose = require("mongoose");

const totallogoutDetailsSchema = new mongoose.Schema({
    logoutemail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    logoutrole : {
        type :String,
        enum: ["student", "teacher", "admin"],
        default: "null"
    },
    lastlogout: Date
});

module.exports = mongoose.model("totallogoutDetails", totallogoutDetailsSchema);