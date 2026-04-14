const express = require("express");
const router = express.Router();
const seventhgrademodel = require("../Schema-details/Class7-schema");
const totalstudentsdetails = require("../Schema-details/StudentDetails-schema");
const { roleCheckingMiddleware, requireRole } = require("../Middle-ware/Role-based-cheking-middle-ware");
router.use(roleCheckingMiddleware);


router.post("/seventhclassstudents", requireRole(["teacher", "admin"]), async (req, res) => {
    try {
        console.log("Received data:", req.body);
        const { stdRollNumber, resultType, result, classurl } = req.body;
        if (!stdRollNumber || !resultType || !result) {
            return res.status(400).json({
                error: "stdRollNumber, resultType and result object are required",
            });
        }

        if (!["mid", "prefinal", "final"].includes(resultType)) {
            return res.status(400).json({ error: "Invalid resultType" });
        }

        const mainStudent = await totalstudentsdetails.findOne({ stdrollNumber: stdRollNumber });

        if (!mainStudent) {
            return res.status(404).json({
                error: "Student not found in main records",
            });
        }

        if (mainStudent.stdclass !== 7) {
            return res.status(400).json({
                error: `Class mismatch: This student belongs to Class ${mainStudent.stdclass}, but you are trying to add marks for 7th Class.`
            });
        }

        let SeventhGradeStudent = await seventhgrademodel.findOne({ stdRollNumber });

        if (!SeventhGradeStudent) {
            SeventhGradeStudent = new seventhgrademodel({
                stdRollNumber: mainStudent.stdrollNumber,
                stdName: mainStudent.stdname,
                stdclass: mainStudent.stdclass,
                result: {}
            });
        }

        const existingResult = SeventhGradeStudent.result?.[resultType];

        if (
            existingResult &&
            Object.values(existingResult).some(val => val != null)
        ) {
            return res.status(400).json({
                message: `${resultType} data already uploaded`,
                existing: existingResult,
            });
        }

        SeventhGradeStudent.result[resultType] = result;
        SeventhGradeStudent.markModified("result");
        const saved = await SeventhGradeStudent.save();

        return res.status(200).json({
            message: `${resultType} marks saved successfully`,
            data: saved
        });
    } catch (error) {
        console.error("Error creating/updating student", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




router.put("/seventhclassstudents", requireRole(["teacher", "admin"]), async (req, res) => {
    try {
        const { stdRollNumber: rollnumber, resultType, result } = req.body;

        if (!rollnumber || !resultType || !result) {
            return res.status(400).json({ error: "rollnumber, resultType and result are required" });
        }

        if (!["mid", "prefinal", "final"].includes(resultType)) {
            return res.status(400).json({ error: "Invalid resultType" });
        }


        const student = await seventhgrademodel.findOne({ stdRollNumber: rollnumber });
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



router.delete("/seventhclassstudents", requireRole(["admin"]), async (req, res) => {
    try {
        const { stdRollNumber: rollnumber } = req.body;
        if (!rollnumber) {
            return res.status(400).json({ error: "rollnumber is required" });
        }
        const deleted = await seventhgrademodel.findOneAndDelete({ stdRollNumber: rollnumber });
        if (!deleted) {
            return res.status(404).json({ message: "Student not exists on that rollnumber" });
        }
        return res.json({ message: "Student deleted successfully", student: deleted });

    } catch (error) {
        console.error("Error deleting student", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/seventhclassstudents", requireRole(["student", "teacher", "admin"]), async (req, res) => {
    try {
        const students = await seventhgrademodel.find();
        return res.json({ students });
    } catch (error) {
        console.error("Error fetching students", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






module.exports = router;