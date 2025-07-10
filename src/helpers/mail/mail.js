const nodemailer = require("nodemailer");
const otpHTML = require("./template/otp");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtp = ({ email, otp }) => {
  transporter.sendMail(
    {
      from: process.env.EMAIL,
      to: email,
      subject: "Your One-Time Password (OTP) for Verification",
      html: otpHTML(email, otp),
    },
    (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        return true;
      }
    }
  );
};
module.exports = { sendOtp };
