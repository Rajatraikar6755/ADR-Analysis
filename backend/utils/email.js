const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, name, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your ADR Analysis Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0084df 0%, #0068b4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #0084df; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #0084df; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 30px; background: #0084df; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 ADR Analysis</h1>
            <p>Welcome to Your Health Companion</p>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>Thank you for registering with ADR Analysis. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">This code expires in 15 minutes</p>
            </div>
            
            <p>If you didn't create an account, please ignore this email.</p>
            
            <p>Best regards,<br><strong>ADR Analysis Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ADR Analysis. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset email
async function sendPasswordResetEmail(email, name, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your ADR Analysis Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0084df 0%, #0068b4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .btn { display: inline-block; padding: 12px 30px; background: #0084df; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            
            <p style="font-size: 12px; color: #666;">Or copy this link: ${resetUrl}</p>
            
            <p style="color: #dc2626; font-size: 14px;">⚠️ This link expires in 1 hour.</p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <p>Best regards,<br><strong>ADR Analysis Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ADR Analysis. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send doctor verification status email
async function sendDoctorVerificationEmail(email, name, status) {
  const isApproved = status === 'APPROVED';
  const subject = isApproved ? 'Congratulations! account verified' : 'Account status update';

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `🏛️ ADR Analysis: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; background: ${isApproved ? '#dcfce7' : '#fee2e2'}; color: ${isApproved ? '#166534' : '#991b1b'}; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 30px; background: #0084df; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Verified!' : 'ℹ️ Profile Update'}</h1>
            <p>ADR Analysis Healthcare Provider</p>
          </div>
          <div class="content">
            <h2>Hello Dr. ${name},</h2>
            <p>Your healthcare provider profile has been reviewed by our administrative team.</p>
            
            <div style="text-align: center;">
              <div class="status-badge">Status: ${status}</div>
            </div>

            ${isApproved
        ? `<p>Your account is now fully active! You can now access your dashboard, manage patient appointments, and appear in search results for patients.</p>
                 <div style="text-align: center;">
                   <a href="${process.env.FRONTEND_URL}/login" class="btn">Login to Dashboard</a>
                 </div>`
        : `<p>Unfortunately, your profile verification could not be completed at this time. This may be due to incomplete documents or license information.</p>
                 <p>Please log in to your profile and review your uploaded documents or contact support for more details.</p>
                 <div style="text-align: center;">
                   <a href="${process.env.FRONTEND_URL}/login" class="btn">Update Profile</a>
                 </div>`
      }
            
            <p>Thank you for your commitment to patient safety.</p>
            
            <p>Best regards,<br><strong>ADR Analysis Admin Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ADR Analysis. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDoctorVerificationEmail,
};