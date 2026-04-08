const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const AdminDetailsController = require("../Schema-details/AdminDetails-schema");


router.get("/admindetails", async (req, res) => {
    try {
        const adminDetails = await AdminDetailsController.find();
        res.status(200).json(adminDetails);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin details" });
    }
});




router.post("/admindetails", async (req, res) => {
    try {
        const { adminName, adminEmail, adminPhoneNumber, adminPassword } = req.body;

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const newAdmin = new AdminDetailsController({
            adminName,
            adminEmail,
            adminPhoneNumber,
            adminPassword: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put("/admindetails/:id", async (req, res) => {
    try {
        const updateAdmin = await AdminDetailsController.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updateAdmin) {
            return res.status(404).json({ error: "Admin details not found" });
        }
        res.status(200).json(updateAdmin);
    } catch (error) {
        res.status(500).json({ error: "Failed to update admin details" });
    }
});


router.delete("/admindetails/:id", async (req, res) => {
    try {
        const deleteAdmin = await AdminDetailsController.findByIdAndDelete(req.params.id);
        if (!deleteAdmin) {
            return res.status(404).json({ error: "Admin details not found" });
        }
        res.status(200).json({ message: "Admin details deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete admin details" });
    }
});

module.exports = router;
