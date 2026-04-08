const mongoose = require('mongoose');

const UserDetailsStudents = new mongoose.Schema({
    stdname: String,
    stdrollNumber: String,
    stdemail: String,
    stdphoneNumber: Number,
    stdpassword: String,
    stdfathername: String,
    stdmothername: String,
    stdgender: String,
    stdaddress: String,
    stdclass :Number,
    stdImage: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    }
});



module.exports = mongoose.model("userdetails_students", UserDetailsStudents);