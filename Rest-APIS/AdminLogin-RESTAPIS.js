const express = require("express");
const router = express.Router();
const AdminLoginController = require("../Schema-details/AdminLogin-schema");
const admindetailssss = require("../Schema-details/AdminDetails-schema");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/AdminLoginDetails", async (req, res) => {
    try {
        const adminLoginDetails = await AdminLoginController.find();
        res.status(200).json(adminLoginDetails);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin login details" });
    }
});


router.post("/AdminLoginDetails", async (req, res) => {
    try {
        const { adminEmail, adminPassword } = req.body;
        if (!adminEmail || !adminPassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const adminSchool = await admindetailssss.findOne({ adminEmail });      
        if (!adminSchool) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const match = await bcrypt.compare(adminPassword, adminSchool.adminPassword);
        if (!match) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        const loginRecord = new AdminLoginController({
            adminEmail: adminSchool.adminEmail,  
            lastlogin: new Date(),
            status: "active",
            role: "admin"
        });

        try {
            await loginRecord.save();
        } catch (saveErr) {
            if (saveErr.code === 11000) {
                console.log('[AdminLogin] ignored duplicate-key when saving login record', saveErr.message);
            } else {
                throw saveErr;
            }
        }

        const token = jwt.sign(
            {
                role: "admin",
                adminEmail: adminSchool.adminEmail,
                adminName: adminSchool.adminName,
                adminPhoneNumber: adminSchool.adminPhoneNumber
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            adminSchool: {
                adminEmail: adminSchool.adminEmail,
                adminName: adminSchool.adminName,
                adminPhoneNumber: adminSchool.adminPhoneNumber,
                role: "admin",
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});




router.put("/AdminLoginDetails/:id", async (req, res) => {
    try {
        const updateAdminLogin = await AdminLoginController.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updateAdminLogin) {
            return res.status(404).json({ error: "Admin login details not found" });
        }
        res.status(200).json(updateAdminLogin);
    } catch (error) {
        res.status(500).json({ error: "Failed to update admin login details" });
    }
});



router.delete("/AdminLoginDetails/:id", async (req, res) => {
    try {
        const deleteAdminLogin = await AdminLoginController.findByIdAndDelete(req.params.id);
        if (!deleteAdminLogin) {
            return res.status(404).json({ error: "Admin login details not found" });
        }
        res.status(200).json({ message: "Admin login details deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete admin login details" });
    }
});

module.exports = router;