const otpHTML = (email, otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Account</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f1f3f5;
      font-family: Arial, sans-serif;
      line-height: 1.5;
      padding: 20px 10px;
    }
    .wrapper {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #1f2a37;
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header img {
      margin: 0;
      height:35px;
    }
    .content {
      padding: 32px 24px;
      text-align: left;
    }
    .content h2 {
      font-size: 22px;
      color: #333;
      margin-bottom: 12px;
    }
    .content p {
      font-size: 16px;
      color: #555;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      margin: 24px 0 5px 0 ;
      color: #000;
      letter-spacing: 2px;
      text-align:center;
    }
    .expiry-note {
      font-size: 14px;
      text-align:center;
      color: #888;
    }
    .footer {
      padding: 20px;
      font-size: 14px;
      color: #777;
      background-color: #f9f9f9;
      text-align: left;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px 5px;
      }
      .content {
        padding: 24px 16px;
      }
      .otp-code {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <div class="header">
      <img src="https://ci3.googleusercontent.com/meips/ADKq_NaOvk_8E43tJ5Y9zAQfOgrhHUkcWmplX_9phzTQ5524uF63T-6bvCyjE9iJs5Oq_MoNkiUGkvv2RiW1FF0mJ9OzmdOgqeRTG5Ac-E1OUONKvse4ksb0Xju19McBmqwrkgVdT8K68DHoo2FqL38cHTfEW0Id-KNLyYI9BhzS_BYPVi_EckWLfFOatsSAubdBpM8cZSrcZRIQbwS1CqhwdIeMrjU=s0-d-e1-ft#https://firebasestorage.googleapis.com/v0/b/use-db.appspot.com/o/assets%2Ffull_logo.png?alt=media&token=b6807ba2-6422-4a6a-9468-be2f3f0170c5" alt="clever"> </img>    
      </div>
    <div class="content">
      <h2>Verify your account</h2>
      <p>Hello,</p>
      <p>Please enter the verification code below to verify your account.</p>
      <div class="otp-code">${otp}</div>
      <p class="expiry-note">(This code will expire 10 minutes after it was sent.)</p>
    </div>
    <div class="footer">
      <p>Do not share this OTP with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,<br><strong>Team Clever</strong></p>
    </div>
  </div>

</body>
</html>
`;
};
module.exports = otpHTML;
