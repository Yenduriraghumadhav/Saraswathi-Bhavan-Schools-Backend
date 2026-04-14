const mongooes = require("mongoose");

const TeacherSchema = new mongooes.Schema({

    TeacherName: {
        type: String,
        required: true
    },
    TeacherEmail: {
        type: String,
        required: true,
        unique : true
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
    TeacherImage : {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },
    TeacherJoinDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongooes.model("Teacher", TeacherSchema);