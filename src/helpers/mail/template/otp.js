const otpHTML = (email, otp) => {
  return `<div class=""><div class="aHl"></div><div id=":op" tabindex="-1"></div><div id=":of" class="ii gt" jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTgzNzI1MTIzMDQ5NjY1MTE4MSJd; 4:WyIjbXNnLWY6MTgzNzI1MTIzMDQ5NjY1MTE4MSIsbnVsbCxudWxsLG51bGwsMSwwLFsxLDAsMF0sMjEzLDEzOTcsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLDEsbnVsbCxudWxsLFszXSxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCwwLDBd"><div id=":oe" class="a3s aiL msg-3956290015287057435"><u></u>
<div width="100%" style="margin:0;background-color:#f0f2f3">
<div style="margin:auto;max-width:600px;padding:50px" class="m_-3956290015287057435email-container">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-3956290015287057435logoContainer" style="background:#252f3d;border-radius:3px 3px 0 0;max-width:600px">
    <tbody><tr>
      <td style="background:#252f3d;border-radius:3px 3px 0 0;padding:20px 0 10px 0;text-align:center">
          <img src="https://firebasestorage.googleapis.com/v0/b/use-db.appspot.com/o/assets%2Ffull_logo.png?alt=media&token=b6807ba2-6422-4a6a-9468-be2f3f0170c5" height="45" alt="Clever logo" border="0" style="font-family:sans-serif;font-size:15px;line-height:140%;color:#555555" class="CToWUd" data-bit="iit">
      </td>
    </tr>
  </tbody></table>
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-3956290015287057435emailBodyContainer" style="border:0px;border-bottom:1px solid #d6d6d6;max-width:600px">
      <tbody><tr>
        <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
          <h1 style="font-size:20px;font-weight:bold;line-height:1.3;margin:0 0 15px 0">Verify your account</h1>
          <p style="margin:0 0 15px 0;padding:0 0 0 0">Hello,</p>
          <p style="margin:0 0 15px 0;padding:0 0 0 0">Please enter the verification code below to verify your account.</p>
        </td>
      </tr>
  <tr>
    <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px;padding-top:0;text-align:center">
      <div style="font-weight:bold;padding-bottom:15px">Verification code</div>
      <div style="color:#000;font-size:36px;font-weight:bold;padding-bottom:15px">${otp}</div>
      <div style="color:#444;font-size:10px">(This code will expire 10 minutes after it was sent.)</div>
    </td>
  </tr>
  <tr>
    <td style="background-color:#fff;border-top:1px solid #e0e0e0;color:#777;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
        <p style="margin:0 0 15px 0;padding:0 0 0 0">Do not share this OTP with anyone.</p>
      <p style="margin:0 0 15px 0;padding:0 0 0 0">If you did not request this, please ignore this email.</p>
      <p style="margin:0 0 15px 0;padding:0 0 0 0">Thanks,<br>Team <strong>Clever</strong></p>
    </td>
  </tr>
  </tbody></table>
  </div></div></div></div></div>`;
};
module.exports = otpHTML;
