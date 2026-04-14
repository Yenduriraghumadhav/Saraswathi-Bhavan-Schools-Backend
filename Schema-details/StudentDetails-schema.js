const mongoose = require('mongoose');

const UserDetailsStudents = new mongoose.Schema({
    stdname: {
        type: String,
        required: true
    },
    stdrollNumber: {
        type: String,
        required: true,
        unique: true
    },
    stdemail: {
        type: String,
        required: true,
        unique: true
    },
    stdphoneNumber: {
        type: Number,
        required: true
    },
    stdpassword: {
        type: String,
        required: true
    },
    stdfathername: {
        type: String
    },
    stdmothername: {
        type: String
    },
    stdgender: {
        type: String
    },
    stdaddress: {
        type: String
    },
    stdclass :{
        type: Number
    },
    stdImage: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    }
});



module.exports = mongoose.model("userdetails_students", UserDetailsStudents);