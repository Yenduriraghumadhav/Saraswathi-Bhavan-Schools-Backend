const teachermodel = require("../Schema-details/Teachers-schema");
const rolebase = require("./Role-based-cheking-middle-ware");

const TeacherCLassVerification = async (req, res, next) => {
    if (req.user.role !== "teacher") {
        return next();
    }

    const requestedClass =
        req.params.teachClass ||
        req.body.teachClass ||
        req.query.teachClass;

    console.log("Requested class from params/body/query:", requestedClass);

    if (!requestedClass) {
        return res.status(400).json({
            message: "Class is required"
        });
    }
    const teacher = await teachermodel.findOne({ TeacherEmail: req.user.email });
    console.log("Teacher record found for email:", req.user.email, "Record exists:", !!teacher);
    const sumclass = req.user.classess;

    if (!teacher) {
        return res.status(404).json({
            message: "Teacher not found"
        });
    }


    if (Number(sumclass) !== Number(requestedClass)) {
        return res.status(403).json({
            message: "Access denied: wrong class"
        });
    }

    next();
};

module.exports = TeacherCLassVerification;