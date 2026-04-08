const express = require("express");
const router = express.Router();
const secondgrademodel = require("../Schema-details/Class2-schema");
const { roleCheckingMiddleware, requireRole } = require("../Middle-ware/Role-based-cheking-middle-ware");
router.use(roleCheckingMiddleware);


router.post("/Secondclassstudents",requireRole([ "teacher", "admin"]), async (req, res) => {
    try {
        const { stdRollNumber, stdName, resultType, result } = req.body;
        if (!stdRollNumber || !resultType || !result) {
            return res.status(400).json({
                error: "stdRollNumber, resultType and result object are required",
            });
        }

        if (!["mid", "prefinal", "final"].includes(resultType)) {
            return res.status(400).json({ error: "Invalid resultType" });
        }


        let student = await secondgrademodel.findOne({ stdRollNumber });

        if (!student) {
            student = new secondgrademodel({ stdName: stdName || "", stdRollNumber });
        }

        if (
            student.result &&
            student.result[resultType] &&
            (student.result[resultType].maths != null ||
                student.result[resultType].science != null ||
                student.result[resultType].english != null ||
                student.result[resultType].telugu != null ||
                student.result[resultType].hindi != null ||
                student.result[resultType].social != null)
        ) {
            return res.status(400).json({
                message: `${resultType} results already entered`,
                existing: student.result[resultType],
            });
        }
        
        student.result = student.result || {};
        student.result[resultType] = {
            maths: result.maths ?? 0,
            science: result.science ?? 0,
            english: result.english ?? 0,
            telugu: result.telugu ?? 0,
            hindi: result.hindi ?? 0,
            social: result.social ?? 0,
        };

        student.markModified("result");

        const saved = await student.save();
        return res.status(student.isNew ? 201 : 200).json(saved);
    } catch (error) {
        console.error("Error creating/updating student", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




router.put("/Secondclassstudents",requireRole([ "teacher", "admin"]), async (req, res) => {
    try {
        const { stdRollNumber: rollnumber, resultType, result } = req.body;

        if (!rollnumber || !resultType || !result) {
            return res.status(400).json({ error: "rollnumber, resultType and result are required" });
        }

        if (!["mid", "prefinal", "final"].includes(resultType)) {
            return res.status(400).json({ error: "Invalid resultType" });
        }


        const student = await secondgrademodel.findOne({ stdRollNumber: rollnumber });
        if (!student) {
            return res.status(404).json({ message: "Student not exists on that rollnumber" });
        }

        if (!Object.keys(result).length) {
            return res.status(400).json({ error: "Result object is empty" });
        }

        student.result = student.result || {};
        student.result[resultType] = Object.assign(
            {},
            student.result[resultType] || {},
            result
        );

        const updated = await student.save();
        return res.json({ message: `${resultType} results updated`, student: updated });
    } catch (error) {
        console.error("Error updating student result", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.delete("/Secondclassstudents",requireRole([ "admin"]), async (req, res) => {
    try {
        const { stdRollNumber: rollnumber } = req.body;
        if (!rollnumber) {
            return res.status(400).json({ error: "rollnumber is required" });
        }
        const deleted = await secondgrademodel.findOneAndDelete({ stdRollNumber: rollnumber });
        if (!deleted) {
            return res.status(404).json({ message: "Student not exists on that rollnumber" });
        }
        return res.json({ message: "Student deleted successfully", student: deleted });

    } catch (error) {
        console.error("Error deleting student", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/Secondclassstudents", requireRole([ "student","teacher", "admin"]),async (req, res) => {
    try {
        const students = await secondgrademodel.find();
        res.json(students);
    } catch (error) {
        console.error("Error fetching students", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






module.exports = router;