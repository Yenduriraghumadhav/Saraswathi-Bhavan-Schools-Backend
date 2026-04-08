require('dotenv').config({path : "./secrt.env"});   
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require("./DataBase-connection/DataBase.js");
const cookieParser = require("cookie-parser");
const mainroute = require("./RoutesFile/Routes.js");
const crors = require("cors");
const app = express();
const path = require("path");
const absolutePath = path.join(__dirname, "studentimageuploads");
app.use(crors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api", mainroute);
app.use("/uploads", express.static(absolutePath));

const PORT = process.env.PORT || 2001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${`http://localhost:${PORT}`}`);
    });
});
