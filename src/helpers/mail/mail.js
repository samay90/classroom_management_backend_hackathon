const otpHTML = require("./template/otp");
const resetHTML = require("./template/resetpassword");
require("dotenv").config();
const sendMail = async ({to,subject,html}) => {
  try{
    await fetch('https://clever-mailer.onrender.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': process.env.MAIL_KEY,
      },
      body: JSON.stringify({
        to,subject,html
      }),
    })
  }catch(err){
    console.log(err.message)
  }
}

const sendOtp =async ({ email, otp }) => {
  await sendMail({to:email,subject:"Your One-Time Password (OTP) for Verification",html:otpHTML(email,otp)})
};
const sendResetPassword =async ({ email, link }) => {
  await sendMail({to:email,subject:"Request to reset your password",html:resetHTML(email,link)})
};
module.exports = { sendOtp, sendResetPassword};
