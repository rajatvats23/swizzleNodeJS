const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM, // Must be verified in SendGrid
    subject: options.subject,
    html: options.html
  };
  
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send email');
  }
};

// Create password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="padding: 10px 15px; background-color: #00A76F; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    <p>Thank you,</p>
    <p>Swizzle Admin Team</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html
  });
};

module.exports = { sendEmail, sendPasswordResetEmail };