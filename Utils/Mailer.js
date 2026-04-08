const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "raghumadhav2002@gmail.com",
    pass: "jntg ukcs myeo sped"
  }
});

module.exports = transporter;