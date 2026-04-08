const express = require("express");
const router = express.Router();
const totallogoutDetails = require("../Schema-details/Logout-forall-schema");

router.post("/totallogoutDetails", async (req, res) => {
    try {
        const { logoutemail, logoutrole } = req.body;
        console.log("Received logout details:", { logoutemail, logoutrole });
        const newLogoutDetails = new totallogoutDetails({
            logoutemail,
            logoutrole
        });
        await newLogoutDetails.save();
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        res.clearCookie("role", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        console.log("Logout successful, token cookie cleared");

        res.status(200).json({
            message: "Logout successful",
            data: newLogoutDetails
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to save logout details" });
    }
});

module.exports = router;