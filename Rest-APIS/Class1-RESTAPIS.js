const express = require("express");
const router = express.Router();
const firstgrademodel = require("../Schema-details/Class1-schema");
const totalstudentsdetails = require("../Schema-details/StudentDetails-schema");
const { roleCheckingMiddleware, requireRole } = require("../Middle-ware/Role-based-cheking-middle-ware");
router.use(roleCheckingMiddleware);
const TeacherCLassVerification = require("../Middle-ware/TeacherCLassVerification");



router.post("/Firstclassstudents", requireRole(["teacher", "admin"]), TeacherCLassVerification, async (req, res) => {
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

        console.log("Searching for Student Roll Number:", stdRollNumber);
        console.log("Searching for Class:", classurl);

        const mainStudent = await totalstudentsdetails.findOne({ stdrollNumber: stdRollNumber });

        if (!mainStudent) {
            return res.status(404).json({
                error: "Student not found in main records",
            });
        }

        if (mainStudent.stdclass !== 1) {
            return res.status(400).json({
                error: `Class mismatch: This student belongs to Class ${mainStudent.stdclass}, but you are trying to add marks for 1st Class.`
            });
        }

        console.log("Main student record found:", mainStudent);

        let firstGradeStudent = await firstgrademodel.findOne({ stdRollNumber });

        if (!firstGradeStudent) {
            firstGradeStudent = new firstgrademodel({
                stdRollNumber: mainStudent.stdrollNumber,
                stdName: mainStudent.stdname,
                stdclass: mainStudent.stdclass,
                result: {}
            });
        }

        console.log("First grade student record before update:", firstGradeStudent);

        const existingResult = firstGradeStudent.result?.[resultType];

        if (
            existingResult &&
            Object.values(existingResult).some(val => val != null)
        ) {
            return res.status(400).json({
                message: `${resultType} data already uploaded`,
                existing: existingResult,
            });
        }

        firstGradeStudent.result[resultType] = result;
        firstGradeStudent.markModified("result");
        const saved = await firstGradeStudent.save();

        return res.status(200).json({
            message: `${resultType} marks saved successfully`,
            data: saved
        });
    } catch (error) {
        console.error("Error updating student result:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.put("/Firstclassstudents", requireRole(["teacher", "admin"]), TeacherCLassVerification, async (req, res) => {
    console.log("received data for update:", req.body);
    try {
        const { stdRollNumber: rollnumber, resultType, result } = req.body;

        if (!rollnumber || !resultType || !result) {
            return res.status(400).json({ error: "rollnumber, resultType, result and classurl are required" });
        }

        if (!["mid", "prefinal", "final"].includes(resultType)) {
            return res.status(400).json({ error: "Invalid resultType" });
        }


        const student = await firstgrademodel.findOne({ stdRollNumber: rollnumber });
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




router.delete("/Firstclassstudents", requireRole(["admin"]), async (req, res) => {
    try {
        const { stdRollNumber: rollnumber } = req.body;
        if (!rollnumber) {
            return res.status(400).json({ error: "rollnumber is required" });
        }
        const deleted = await firstgrademodel.findOneAndDelete({ stdRollNumber: rollnumber });
        if (!deleted) {
            return res.status(404).json({ message: "Student not exists on that rollnumber" });
        }
        return res.json({ message: "Student deleted successfully", student: deleted });

    } catch (error) {
        console.error("Error deleting student", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/Firstclassstudents", requireRole(["student", "teacher", "admin"]), async (req, res) => {
    try {
        const students = await firstgrademodel.find();
        return res.json({ students });
    } catch (error) {
        console.error("Error fetching students", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





module.exports = router;