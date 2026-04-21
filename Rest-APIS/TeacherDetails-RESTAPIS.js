const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const TeacherDetails = require("../Schema-details/Teachers-schema");

router.post("/TeacherDetails", async (req, res) => {
    try {
        const { TeacherName, TeacherEmail, TeacherPassword, TeacherPhone, TeacherAddress, TeacherStatus, TeacherGender ,TeacherImage ,TeacherAssignedclass} = req.body;
        if (!TeacherName || !TeacherEmail || !TeacherPassword || !TeacherPhone || !TeacherAddress || !TeacherGender || !TeacherImage || !TeacherAssignedclass) {
            return res.status(400).json({
                error: "All fields are required",
            });
        }
        const existingTeacherByEmail = await TeacherDetails.findOne({ TeacherEmail });

        if (existingTeacherByEmail) {
            return res.status(400).json({
                message: "Teacher with this email already exists",
            });
        }

        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(TeacherEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const domain = TeacherEmail.split('@')[1]?.toLowerCase();

        if (!allowedDomains.includes(domain)) {
            return res.status(400).json({ error: "Email domain not allowed" });
        }




        const phoneStr = String(TeacherPhone);
        if (!/^[0-9]{10}$/.test(phoneStr)) {
            return res.status(400).json({ error: "Phone number must be 10 digits" });
        }


        if (!['male', 'female', 'others'].includes(TeacherGender.toLowerCase())) {
            return res.status(400).json({ error: "Gender must be male, female, or others" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(TeacherPassword, saltRounds);
        const newTeacher = new TeacherDetails({
            TeacherName,
            TeacherEmail,
            TeacherPassword: hashedPassword,
            TeacherPhone,
            TeacherAddress,
            TeacherGender,
            TeacherStatus,
            TeacherImage,
            TeacherAssignedclass
        });
        const saved = await newTeacher.save();
        return res.status(201).json(saved);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/TeacherDetails", async (req, res) => {
    try {
        const teachers = await TeacherDetails.find();
        return res.status(200).json(teachers);
    }
    catch (error) {
        console.error("Error fetching teacher details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});







module.exports = router;