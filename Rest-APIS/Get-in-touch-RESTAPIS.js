const express = require("express");
const router = express.Router();
const GetInTouchDetails = require("../Schema-details/Get-in-touch-schema");

router.get("/GetInTouchDetails", async (req, res) => {
    try {
        const getInTouchDetails = await GetInTouchDetails.find();
        res.status(200).json(getInTouchDetails);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Get In Touch details" });
    }
});


module.exports = router;