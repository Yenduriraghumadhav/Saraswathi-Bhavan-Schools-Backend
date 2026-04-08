const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const FifthClassSchema = new mongoose.Schema({

    stdName: String,
    stdRollNumber: String,
    stdclass: { type: Number, default: 5 },
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

module.exports = mongoose.model("fifthclass-stds", FifthClassSchema);