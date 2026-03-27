require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require("./DataBase-connection/DataBase.js");
const mainroute = require("./RoutesFile/Routes.js");
const crors = require("cors");
const app = express();
app.use(crors());
app.use(express.json());
app.use("/api", mainroute);

const PORT = process.env.PORT || 2001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${`http://localhost:${PORT}`}`);
    });
});
