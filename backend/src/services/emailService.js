const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const templates = {
  welcome: (data) => ({
    subject: `Welcome to NeuralPath, ${data.name}! 🚀`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#6c63ff,#4f46e5);padding:2rem;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0">⚡ NeuralPath</h1>
          <p style="color:rgba(255,255,255,.8)">Your AI Learning Journey Begins</p>
        </div>
        <div style="padding:2rem;background:#fff">
          <h2>Hello ${data.name}! 👋</h2>
          <p>Welcome to NeuralPath — your AI-powered path to coding excellence and career success.</p>
          <a href="${data.verifyUrl}" style="display:inline-block;background:#6c63ff;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:600">Verify Email →</a>
          <hr style="margin:2rem 0;border:none;border-top:1px solid #eee">
          <h3>What's waiting for you:</h3>
          <ul>
            <li>🤖 AI Tutor with 3 learning modes</li>
            <li>📚 500+ DSA & Aptitude problems</li>
            <li>🧪 Mock tests with AI analytics</li>
            <li>💼 Interview simulation</li>
          </ul>
        </div>
      </div>`
  }),
  resetPassword: (data) => ({
    subject: 'NeuralPath — Password Reset',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem">
        <h2>Password Reset Request</h2>
        <p>Hi ${data.name}, click below to reset your password. This link expires in 10 minutes.</p>
        <a href="${data.resetUrl}" style="display:inline-block;background:#6c63ff;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none">Reset Password →</a>
        <p style="color:#666;margin-top:1.5rem;font-size:14px">If you didn't request this, ignore this email.</p>
      </div>`
  })
};

exports.sendEmail = async ({ to, template, data, subject, html }) => {
  try {
    const tmpl = templates[template]?.(data) || {};
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'NeuralPath'}" <${process.env.FROM_EMAIL}>`,
      to,
      subject: subject || tmpl.subject,
      html: html || tmpl.html
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Email error:', error.message);
    throw error;
  }
};
