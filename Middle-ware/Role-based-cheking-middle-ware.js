const jwt = require('jsonwebtoken');
const teacherModel = require("../Schema-details/TeachersLogin-schema");  
const adminModel = require("../Schema-details/AdminDetails-schema");    
const studentmodel = require("../Schema-details/StudentDetails-schema");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const roleCheckingMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userEmail = decoded.TeacherEmail || decoded.adminEmail || decoded.stdemail;
    const userRole = decoded.role;

    console.log("🔍 Token decoded:", { userEmail, userRole });

    let user;
    if (userRole === "teacher") {
      user = await teacherModel.findOne({ TeacherEmail: userEmail });
    } else if (userRole === "admin") {
      user = await adminModel.findOne({ adminEmail: userEmail });
    } else if (userRole === "student") {
      user = await studentmodel.findOne({ stdemail: userEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.user = {
      id: user._id,
      email: userEmail,
      role: userRole,
      status: user.status || user.adminStatus
    };

    next();
  } catch (error) {
    console.error(" Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};


const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { roleCheckingMiddleware, requireRole };
