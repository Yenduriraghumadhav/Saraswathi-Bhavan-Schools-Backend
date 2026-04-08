const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const studentDetailsmodel = require("../Schema-details/StudentDetails-schema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join(__dirname, "..", "studentimageuploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/StudentDetails", upload.single("stdImage"), async (req, res) => {
    try {
        const { stdname, stdrollNumber, stdemail, stdphoneNumber, stdaddress, stdpassword, stdfathername, stdmothername, stdgender, stdclass } = req.body;
        console.log("[StudentDetails] Received data:", req.body);
        const stdImage = req.file ? req.file.filename : null;

        if (!stdrollNumber || !stdemail || !stdphoneNumber || !stdaddress || !stdpassword || !stdfathername || !stdmothername || !stdgender || !stdname || !stdclass) {
            return res.status(400).json({
                error: "All fields are required",
            });
        }

        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(stdemail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        const domain = stdemail.split('@')[1]?.toLowerCase();
        if (!allowedDomains.includes(domain)) {
            return res.status(400).json({ error: "Email domain not allowed" });
        }


        const phoneStr = String(stdphoneNumber);
        if (!/^[0-9]{10}$/.test(phoneStr)) {
            return res.status(400).json({ error: "Phone number must be 10 digits" });
        }


        if (!['male', 'female', 'others'].includes(stdgender.toLowerCase())) {
            return res.status(400).json({ error: "Gender must be male, female, or others" });
        }

        if (stdclass <= 1 || stdclass >= 10) {
            return res.status(400).json({ error: "Class must be between 1 and 10" });
        }


        let student = await studentDetailsmodel.findOne({ stdrollNumber });
        if (student) {
            return res.status(400).json({
                message: "Student with this roll number already exists",
            });
        }
        student = await studentDetailsmodel.findOne({ stdemail });
        if (student) {
            return res.status(400).json({
                message: "Student with this email already exists",
            });
        }


        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(stdpassword, saltRounds);
        console.log("[StudentDetails] hashed password:", hashedPassword);

        student = new studentDetailsmodel({
            stdname,
            stdrollNumber,
            stdemail,
            stdphoneNumber,
            stdaddress,
            stdpassword: hashedPassword,
            stdfathername,
            stdmothername,
            stdgender,
            stdImage,
            stdclass
        });
        const saved = await student.save();
        console.log("[StudentDetails] record created for", saved.stdemail);
        res.status(201).json({
            message: "Student saved successfully",
            student: saved,
            image: saved.stdImage
        });
    } catch (error) {
        console.error("Error saving student details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.put("/StudentDetails", async (req, res) => {
    try {
        const { stdrollNumber } = req.body;
        if (!stdrollNumber) {
            return res.status(400).json({ error: "rollNumber is required to identify student" });
        }


        const student = await studentDetailsmodel.findOne({ stdrollNumber });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        const {
            stdname,
            stdemail,
            stdphoneNumber,
            stdgender,
            stdaddress,
            stdfathername,
            stdmothername,
            stdrollNumber: newRoll,
            stdImage,
            role,
        } = req.body;


        const isPrivileged = role === "admin" || role === "teacher";
        if (!isPrivileged) {
            if (newRoll || stdaddress || stdfathername || stdmothername || stdImage) {
                return res.status(403).json({
                    error: "Not authorized to update rollNumber, father name, mother name, or year",
                });
            }
        } else {
            if (newRoll) student.stdrollNumber = newRoll;
            if (stdaddress) student.stdaddress = stdaddress;
            if (stdfathername) student.stdfathername = stdfathername;
            if (stdmothername) student.stdmothername = stdmothername;
            if (stdImage) student.stdImage = stdImage;
        }


        if (stdname) student.stdname = stdname;
        if (stdemail) student.stdemail = stdemail;
        if (stdphoneNumber) student.stdphoneNumber = stdphoneNumber;
        if (stdgender) student.stdgender = stdgender;

        const updated = await student.save();
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating student details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.delete("/StudentDetails", async (req, res) => {
    try {
        const { stdrollNumber } = req.body;
        const student = await studentDetailsmodel.findOneAndDelete({ stdrollNumber });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/StudentDetails", async (req, res) => {
    try {
        const students = await studentDetailsmodel.find();
        return res.status(200).json(students);
    }
    catch (error) {
        console.error("Error fetching student details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});






module.exports = router;