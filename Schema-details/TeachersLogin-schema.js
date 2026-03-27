const mongoose = require("mongoose");

const teacherLoginSchema = new mongoose.Schema({
    TeacherEmail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    role : {type: String , default: "teacher"},
    lastlogin: Date
});

module.exports = mongoose.model("TeacherLoginDetails", teacherLoginSchema);