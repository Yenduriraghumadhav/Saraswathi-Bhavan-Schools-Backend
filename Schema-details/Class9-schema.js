const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const NinthClassSchema = new mongoose.Schema({

    stdName: String,
    stdRollNumber: String,
    stdclass: { type: Number, default: 9 },
    result: {

        mid: {
            telugu: Number,
            hindi: Number,
            social: Number,
            maths: Number,
            science: Number,
            english: Number
        },

        prefinal: {
            telugu: Number,
            hindi: Number,
            social: Number,
            maths: Number,
            science: Number,
            english: Number
        },

        final: {
            telugu: Number,
            hindi: Number,
            social: Number,
            maths: Number,
            science: Number,
            english: Number
        }

    }

});

module.exports = mongoose.model("ninthclass-stds", NinthClassSchema);