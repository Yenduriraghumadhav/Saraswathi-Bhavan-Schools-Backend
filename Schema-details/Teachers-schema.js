const mongooes = require("mongoose");

const TeacherSchema = new mongooes.Schema({

    TeacherName: {
        type: String,
        required: true
    },
    TeacherEmail: {
        type: String,
        required: true
    },
    TeacherPassword: {
        type: String,
        required: true
    },
    TeacherPhone: {
        type: Number,
        required: true
    },
    TeacherAddress: {
        type: String,
        required: true
    },
    TeacherStatus: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    TeacherGender: {
        type: String,
        enum: ["male", "female", "others"],
        default: "male"
    },
    TeacherJoinDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongooes.model("Teacher", TeacherSchema);