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

router.post("/GetInTouchDetails", async (req, res) => {
    try {
        const { supportName, supportEmail, supportMobileNumber } = req.body;
        const newGetInTouch = new GetInTouchDetails({ supportName, supportEmail, supportMobileNumber });
        await newGetInTouch.save();

        res.status(201).json({ message: "Get In Touch details saved successfully" });
    } catch (error) {
       return res.status(500).json({ error: "Failed to save Get In Touch details" });
    }
});


module.exports = router;