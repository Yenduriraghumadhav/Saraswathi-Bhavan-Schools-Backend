const mongoose = require("mongoose");
const route = require("express");
const router = route.Router();
const otpmodel = require("../Schema-details/Otp-for-students-schema");
const totalstudentsdetails = require("../Schema-details/StudentDetails-schema");
const otpgenerate = require("otp-generator");
const sendmail = require("../Utils/Otp-for-students-mailer");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const bcrypt = require("bcrypt");



router.post("/sendotp", async (req, res) => {
    console.log("std email", req.body);
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "enter the email" });
        }

        const studfound = await totalstudentsdetails.findOne({ stdemail: email });
        console.log("totalstudentsdetails", studfound);
        if (!studfound) {
            return res.status(404).json({ message: "email not found in db" });
        }

        const otpsend = otpgenerate.generate(4, { digits: true });
        console.log("otp", otpsend);

        const otpstore = new otpmodel({
            resetemail: email,
            resetotp: otpsend
        });
        await otpstore.save();
        console.log("otp stored in db");
        await otpmodel.findOneAndUpdate(
            { resetemail: email },
            {
                resetotp: otpsend,
                createdAt: new Date()
            },
            { upsert: true }
        );

        console.log("otp stored in db");
        await sendmail.sendMail({
            to: email,
            subject: "Password Reset Code",
            html: `<h1 style="font-size: 48px;">${otpsend}</h1>`
        });
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in sendotp:", error);
        res.status(500).json({ message: "Server error" });
    }
})



router.post("/verifyotp", async (req, res) => {
    console.log("verify otps", req.body);

    try {
        const { email, otps } = req.body;
        if (!email || !otps) {
            return res.status(400).json({ message: "enter the email and otp" });
        }

        const otpdata = await otpmodel.findOne({ resetemail: email });
        console.log("otpdata", otpdata);
        if (!otpdata) {
            return res.status(404).json({ message: "otp not found for the email" });
        }
        if (otpdata.resetotp !== otps) {
            return res.status(400).json({ message: "invalid otp" });
        }
        const resetToken = jwt.sign(
            { email },
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


router.post("/resetpassword", async (req, res) => {
    console.log("reset-password", req.body);
    try {
        const { email, newpassword, resetToken } = req.body;
        if (!email || !newpassword || !resetToken) {
            return res.status(400).json({ message: "enter the email, new password and reset token" });
        }

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        const hashedPassword = await bcrypt.hash(newpassword, 10);

        const updateuser = await totalstudentsdetails.findOne({ stdemail: email });
        if (!updateuser) {
            return res.status(404).json({ message: "email not found in db" });
        }


        updateuser.stdpassword = hashedPassword;
        await updateuser.save();


        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
})



module.exports = router;