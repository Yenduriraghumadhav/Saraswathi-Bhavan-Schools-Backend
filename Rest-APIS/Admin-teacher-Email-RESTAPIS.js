const express = require("express");
const router = express.Router();
const Invite = require("../Schema-details/Admin-teacher-Email-schema");
const transporter = require("../Utils/Mailer");


router.post("/invite", async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ error: "Email and role are required" });
        }


        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const domain = email.split('@')[1]?.toLowerCase();
        if (!allowedDomains.includes(domain)) {
            return res.status(400).json({ error: "Email domain not allowed" });
        }


        if (!['TEACHER', 'ADMIN'].includes(role.toUpperCase())) {
            return res.status(400).json({ error: "Role must be TEACHER or ADMIN" });
        }


        const existingInvite = await Invite.findOne({ email });
        if (existingInvite) {
            return res.status(400).json({ error: "An invite for this email already exists" });
        }


        const token = require("crypto").randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const invite = new Invite(
            {
                email, role: role.toUpperCase(),
                token,
                expiresAt
            }
        );

        await invite.save();

        const link = `http://localhost:5173/teacherSignUppage?token=${token}`;

        await transporter.sendMail({
            from: "raghumadhav2002@gmail.com",
            to: email,
            subject: "Welcome To Saraswathi-Bhavan Schools!",
            html: `
                  <h3>You are invited as ${role}</h3>
                  <p>Click below to register:</p>
                  <a href="${link}">${link}</a>
                  <p>This link expires in 2 hours</p>`
        });
        res.status(201).json({ message: "Invite created successfully", token });
    } catch (error) {
        console.error("Error creating invite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;