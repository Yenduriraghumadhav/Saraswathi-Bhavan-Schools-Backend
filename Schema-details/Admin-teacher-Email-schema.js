const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  token: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: String,
    enum: ["TEACHER", "ADMIN"],
    default: "TEACHER"
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "2h" } 
  }

}, { timestamps: true });

module.exports = mongoose.model("AdminTeacherInvite", inviteSchema);