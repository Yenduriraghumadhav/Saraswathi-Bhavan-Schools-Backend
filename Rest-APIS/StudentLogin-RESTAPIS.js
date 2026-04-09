const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const studentLoginDetailsModel = require("../Schema-details/StudentLogin-schema");
const studentDetailsmodel = require("../Schema-details/StudentDetails-schema");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// This function checks the indexes in the student login collection and removes a legacy 
// index (stdrollNumber_1). That index can cause duplicate key errors when the same user logs in multiple times.
//  By removing it, the system allows multiple login records for the same user and prevents database crashes.

async function ensureNoLegacyIndex(context) {
    try {
        const ix = await studentLoginDetailsModel.collection.getIndexes();
    } catch { }

    try {
        await studentLoginDetailsModel.collection.dropIndex('stdrollNumber_1');
    } catch (err) {
        console.log(`[StudentLogin] dropIndex error ${context}`, err.message);
    }
}

// run once when module loads
ensureNoLegacyIndex('on load');

const bcrypt = require("bcrypt");

router.get("/studentLogin", async (req, res) => {
    try {
        const studentLoginDetails = await studentLoginDetailsModel.find();
        return res.status(200).json(studentLoginDetails);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.post("/studentLogin", async (req, res) => {
    try {
        const { stdemail, stdpassword } = req.body;
        if (!stdemail || !stdpassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await studentDetailsmodel.findOne({ stdemail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(stdpassword, user.stdpassword);
        if (!match) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        await ensureNoLegacyIndex('before insert');

        const loginRecord = new studentLoginDetailsModel({
            stdemail: user.stdemail,
            lastlogin: new Date(),
            status: "active",
            role: "student"
        });

        try {
            await loginRecord.save();
        } catch (saveErr) {
            if (saveErr.code === 11000) {
                console.log('[StudentLogin] ignored duplicate-key when saving login record', saveErr.message);
            } else {
                throw saveErr;
            }
        }

        const token = jwt.sign(
            {
                stdemail: user.stdemail,
                stdname: user.stdname,
                stdrollNumber: user.stdrollNumber,
                role: "student",
                stdphoneNumber: user.stdphoneNumber,
                stdImage: user.stdImage,
                stdclass: user.stdclass
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        })
            .cookie("role", "student", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200).json({
                message: "Login successful",
                user: {
                    stdemail: user.stdemail,
                    stdname: user.stdname,
                    stdrollNumber: user.stdrollNumber,
                    role: "student",
                    stdphoneNumber: user.stdphoneNumber,
                    stdImage: user.stdImage,
                    stdclass: user.stdclass
                }
            });


    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.delete("/studentLogin", async (req, res) => {
    try {
        let { stdemail } = req.body;
        if (!stdemail) {
            return res.status(400).json({ message: "Email is required" });
        }
        await studentLoginDetailsModel.deleteMany({ stdemail });
        return res.status(200).json({ message: "Login records deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router;