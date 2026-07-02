const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const TeacherDetails = require("../Schema-details/Teachers-schema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join(__dirname, "..", "studentimageuploads");
const { roleCheckingMiddleware, requireRole } = require("../Middle-ware/Role-based-cheking-middle-ware");
router.use(roleCheckingMiddleware);

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

router.post("/TeacherDetails", requireRole(["admin"]), upload.single("TeacherImage"), async (req, res) => {
    try {
        console.log(req.body)
        const { TeacherName, TeacherEmail, TeacherPassword, TeacherPhone, TeacherAddress, TeacherStatus, TeacherGender, TeacherAssignedclass } = req.body;

        const TeacherImage = req.file ? req.file.filename : null;
        console.log("[TeacherDetails] TeacherImage filename:", TeacherImage);

        if (!TeacherImage) {
            return res.status(400).json({ error: "Teacher image is required" });
        }

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
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
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