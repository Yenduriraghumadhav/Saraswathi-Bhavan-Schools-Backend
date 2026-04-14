const jwt = require('jsonwebtoken');
const teacherModel = require("../Schema-details/TeachersLogin-schema");  
const adminModel = require("../Schema-details/AdminDetails-schema");    
const studentModel = require("../Schema-details/StudentDetails-schema");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";


const roleCheckingMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token; 
    if (!token) {
      return res.status(401).json({ message: "No token provided in cookies" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userEmail = decoded.TeacherEmail || decoded.adminEmail || decoded.stdemail || decoded.email;
    const userRole = decoded.role;


    let user;
    if (userRole === "teacher") {
      user = await teacherModel.findOne({ TeacherEmail: userEmail });
    } else if (userRole === "admin") {
      user = await adminModel.findOne({ adminEmail: userEmail });
    } else if (userRole === "student") {
      user = await studentModel.findOne({ stdemail: userEmail });
    }

    console.log("🔍 User found in DB:", !!user, "Role:", userRole, "Email:", userEmail);

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
    console.error("Auth error:", error.message);
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