const mongoose = require("mongoose");
const route = require("express");
const router = route.Router();
const teacherotpmodel = require("../Schema-details/Otp-for-teachers-schema");
const totalteachersdetails = require("../Schema-details/Teachers-schema");
const otpgenerate = require("otp-generator");
const sendmail = require("../Utils/Otp-for-students-mailer");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const bcrypt = require("bcrypt");



router.post("/sendteachersotp", async (req, res) => {
    console.log("teacher email", req.body);
    try {
        const { teacheremail } = req.body;
        if (!teacheremail) {
            return res.status(400).json({ message: "enter the email" });
        }

        const studfound = await totalteachersdetails.findOne({ TeacherEmail: teacheremail });
        console.log("totalteachersdetails", studfound);
        if (!studfound) {
            return res.status(404).json({ message: "email not found in db" });
        }

        const teacherotpsend = otpgenerate.generate(6, { digits: true });
        console.log("otp", teacherotpsend);

        const otpstore = new teacherotpmodel({
            teacherresetemail: teacheremail,
            teacherresetotp: teacherotpsend
        });
        await otpstore.save();
        console.log("otp stored in db");
        await teacherotpmodel.findOneAndUpdate(
            { teacherresetemail: teacheremail },
            {
                teacherresetotp: teacherotpsend,
                createdAt: new Date()
            },
            { upsert: true }
        );

        console.log("otp stored in db");
        await sendmail.sendMail({
            to: teacheremail,
            subject: "Password Reset Code",
            html: `<h1 style="font-size: 48px;">${teacherotpsend}</h1>`
        });
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in sendotp:", error);
        res.status(500).json({ message: "Server error" });
    }
})



router.post("/verifyteacherotp", async (req, res) => {
    console.log("verify otps", req.body);

    try {
        const { teacheremail, otps } = req.body;
        if (!teacheremail || !otps) {
            return res.status(400).json({ message: "enter the email and otp" });
        }

        const otpdata = await teacherotpmodel.findOne({ teacherresetemail: teacheremail });
        console.log("otpdata", otpdata);
        if (!otpdata) {
            return res.status(404).json({ message: "otp not found for the email" });
        }
        if (otpdata.teacherresetotp !== otps) {
            return res.status(400).json({ message: "invalid otp" });
        }
        const resetToken = jwt.sign(
            { email: teacheremail },
            process.env.JWT_SECRET,
            { expiresIn: "45sec" }
        );

        res.status(200).json({
            message: "OTP verified successfully",
            resetToken
        });


    } catch (error) {
        console.error("Error in verifyotp:", error);
        res.status(500).json({ message: "Server error" });
    }

})


router.post("/resetteacherpassword", async (req, res) => {
    console.log("resetteacherpassword", req.body);
    try {
        const { teacheremail, newpassword, resetToken } = req.body;
        if (!teacheremail || !newpassword || !resetToken) {
            return res.status(400).json({ message: "enter the teacher email, new password and reset token" });
        }

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        const hashedPassword = await bcrypt.hash(newpassword, 10);

        const updateuser = await totalteachersdetails.findOne({ TeacherEmail: teacheremail });
        if (!updateuser) {
            return res.status(404).json({ message: "teacher email not found in db" });
        }


        updateuser.TeacherPassword = hashedPassword;
        await updateuser.save();


        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
})



module.exports = router;