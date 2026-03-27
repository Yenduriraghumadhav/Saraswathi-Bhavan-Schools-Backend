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
    stdaddress : String
});



module.exports = mongoose.model("userdetails_students", UserDetailsStudents);