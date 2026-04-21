const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { roleCheckingMiddleware, requireRole } = require("../Middle-ware/Role-based-cheking-middle-ware");
router.use(roleCheckingMiddleware);


router.get("/filteredstudentmarks", requireRole(["student"]), async (req, res) => {

    try {
        const { rollNumber, stdclass } = req.query;

        if (!rollNumber || !stdclass) {
            return res.status(400).json({
                message: "rollNumber and stdclass are required"
            });
        }
        const collectionMap = {
            1: "firstclass_stds",
            2: "secondclass-stds",
            3: "thirdclass-stds",
            4: "fourthclass-stds",
            5: "fifthclass-stds",
            6: "sixthclass-stds",
            7: "seventhclass-stds",
            8: "eighthclass-stds",
            9: "ninthclass-stds",
            10: "tenthclass-stds"
        };

        const collectionName = collectionMap[stdclass];

        if (!collectionName) {
            return res.status(400).json({ message: "Invalid class" });
        }

        const student = await mongoose.connection.db
            .collection(collectionName).findOne({ stdRollNumber: rollNumber });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ data: student });


    } catch (error) {
        return res.status(500).json({ error: "An error occurred while fetching total student marks." });
    }
});



module.exports = router;