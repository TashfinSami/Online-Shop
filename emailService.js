// emailService.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  /* Configure email transport options here */
});

function sendVerificationEmail(userEmail, verificationCode, verificationLink) {
  const mailOptions = {
    from: 'tashfinsami@gmail.com',
    to: userEmail,
    subject: 'Email Verification',
    html: `
      <p>Hello [User],</p>
      <p>Thank you for signing up. Your verification code is: ${verificationCode}.</p>
      <p>To verify your email, click on the following link: <a href="${verificationLink}">${verificationLink}</a></p>
      <p>Regards,<br>Your App Team</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = { sendVerificationEmail };
