
const mongoose = require('mongoose');

const ConnectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://raghum_db_user:raghu2002@cluster0.yl15mil.mongodb.net/SchoolManagementSystem?retryWrites=true&w=majority");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB", err);
        process.exit(1); 
    }
}

module.exports = ConnectDB;
