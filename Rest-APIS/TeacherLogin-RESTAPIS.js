const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const jwt = require("jsonwebtoken");
const teacherLoginDetailsModel = require("../Schema-details/TeachersLogin-schema");
const teacherDetailsModel = require("../Schema-details/Teachers-schema");



router.post("/teacherLogin", async (req, res) => {
    try {
        const { TeacherEmail, TeacherPassword } = req.body;

        if (!TeacherEmail || !TeacherPassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await teacherDetailsModel.findOne({ TeacherEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(TeacherPassword, user.TeacherPassword);
        if (!match) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        const loginRecord = new teacherLoginDetailsModel({
            TeacherEmail: user.TeacherEmail,
            lastlogin: new Date(),
            status: "active",
            role: "teacher"
        });

        try {
            await loginRecord.save();
        } catch (saveErr) {
            console.log('[TeacherLogin] login record error:', saveErr.message);
        }

        const token = jwt.sign(
            {
                role: "teacher",
                TeacherEmail: user.TeacherEmail,
                TeacherName: user.TeacherName,
                TeacherAssignedclass: user.TeacherAssignedclass
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        })
            .cookie("role", "teacher", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                message: "Login successful",
                user: {
                    role: "teacher",
                    TeacherEmail: user.TeacherEmail,
                    TeacherName: user.TeacherName,
                    TeacherPhone: user.TeacherPhone,
                    TeacherAddress: user.TeacherAddress,
                    TeacherImage: user.TeacherImage,
                    TeacherAssignedclass: user.TeacherAssignedclass
                }
            });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/teacherLogin", async (req, res) => {
    try {
        const loginRecords = await teacherLoginDetailsModel.find();
        return res.status(200).json(loginRecords);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = router;