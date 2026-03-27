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

        const user = await teacherDetailsModel.findOne({ TeacherEmail: TeacherEmail });
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


        const token = jwt.sign(
            {
                role: "teacher",
                TeacherEmail: user.TeacherEmail,
                TeacherID: user.TeacherID,
                TeacherName: user.TeacherName
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );


        try {
            await loginRecord.save();
            return res.status(200).json({
                message: "Login successful",
                token: token,
                user: {
                    TeacherEmail: user.TeacherEmail,
                    TeacherID: user.TeacherID,
                    TeacherName: user.TeacherName,
                    role: "teacher"
                }
            });
        } catch (saveErr) {
            return res.status(500).json({ message: "Error saving login record", error: saveErr.message });
        }
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