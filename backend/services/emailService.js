const nodemailer = require('nodemailer');
const { EmailLog } = require('../models/index');

// ── Create transporter ────────────────────────────────────────
function createTransporter() {
  // Production: use real SMTP (Gmail, SendGrid, SES, etc.)
  if (process.env.SMTP_HOST && process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development: use Ethereal (fake SMTP, emails captured online)
  // OR use Gmail with app password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Fallback: console-only (no real email sent)
  return null;
}

// ── Brand colors & shared layout ────────────────────────────
const emailBase = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0A0A0F; color: #E2E8F0; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1A1A2E, #0F0F1A); padding: 32px 40px; border-bottom: 3px solid #F5C518; }
    .logo { font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #fff; }
    .logo span { color: #F5C518; }
    .body { background: #12121A; padding: 40px; border: 1px solid #2A2A3E; }
    .footer { background: #0A0A0F; padding: 24px 40px; text-align: center; font-size: 12px; color: #4B5563; border-top: 1px solid #2A2A3E; }
    .btn { display: inline-block; background: #F5C518; color: #0A0A0F; font-weight: 800; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; margin: 24px 0; letter-spacing: 0.5px; }
    .btn-outline { display: inline-block; border: 2px solid #F5C518; color: #F5C518; font-weight: 700; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; margin: 12px 0; }
    .info-box { background: #1A1A2E; border: 1px solid #2A2A3E; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2A2A3E; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6B7280; }
    .info-value { color: #E2E8F0; font-weight: 600; }
    .highlight { color: #F5C518; font-weight: 700; }
    .success-icon { font-size: 48px; text-align: center; margin: 0 0 20px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; }
    .badge-green { background: rgba(0,230,118,0.15); color: #00E676; border: 1px solid rgba(0,230,118,0.3); }
    .badge-red   { background: rgba(255,51,102,0.15); color: #FF3366; border: 1px solid rgba(255,51,102,0.3); }
    .badge-yellow{ background: rgba(245,197,24,0.15); color: #F5C518; border: 1px solid rgba(245,197,24,0.3); }
    h1 { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    h2 { font-size: 18px; font-weight: 700; color: #F5C518; margin: 20px 0 10px; }
    p  { color: #9CA3AF; font-size: 14px; line-height: 1.7; margin-bottom: 12px; }
    .creds-box { background: #0A0A0F; border: 2px solid #F5C518; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .cred-item { font-size: 14px; padding: 6px 0; }
    .cred-key { color: #6B7280; }
    .cred-val { color: #F5C518; font-weight: 700; font-family: monospace; font-size: 15px; }
    .warning-box { background: rgba(255,51,102,0.08); border: 1px solid rgba(255,51,102,0.3); border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
    .warning-box p { color: #FF3366; margin: 0; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">CYBER<span>TECH</span> INSTITUTE</div>
    <div style="font-size:12px;color:#6B7280;margin-top:4px">Professional IT Training</div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>CyberTech Institute • No. 42, IT Park Road, Tidel Park, Chennai - 600113</p>
    <p>📞 +91 98765 43210 • ✉️ info@cybertech.com</p>
    <p style="margin-top:8px;color:#374151">© ${new Date().getFullYear()} CyberTech Institute. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;

// ── Email Templates ───────────────────────────────────────────

// 1. Admin notification when payment received
const adminPaymentNotification = ({ studentName, studentEmail, courseName, amount, enrollmentId }) => ({
  subject: `💰 New Payment Received — ${studentName} enrolled in ${courseName}`,
  html: emailBase(`
    <div class="success-icon">💰</div>
    <h1>New Enrollment Payment</h1>
    <p>A new payment has been received and is <span class="highlight">awaiting your approval</span>.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Student Name</span><span class="info-value">${studentName}</span></div>
      <div class="info-row"><span class="info-label">Student Email</span><span class="info-value">${studentEmail}</span></div>
      <div class="info-row"><span class="info-label">Course</span><span class="info-value">${courseName}</span></div>
      <div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value highlight">₹${Number(amount).toLocaleString()}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="badge badge-yellow">Pending Approval</span></div>
    </div>
    <p>Please review this enrollment request in the admin panel.</p>
    <a href="${process.env.CLIENT_URL}/admin/enrollments" class="btn">Review Enrollment →</a>
  `),
});

// 2. Student payment confirmation (awaiting approval)
const studentPaymentConfirmation = ({ studentName, courseName, amount, invoiceNumber }) => ({
  subject: `✅ Payment Received — ${courseName} | CyberTech Institute`,
  html: emailBase(`
    <div class="success-icon">🎉</div>
    <h1>Payment Received Successfully!</h1>
    <p>Dear <strong style="color:#fff">${studentName}</strong>,</p>
    <p>We have received your payment for <span class="highlight">${courseName}</span>. Your enrollment is now under review by our team.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Course</span><span class="info-value">${courseName}</span></div>
      <div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value highlight">₹${Number(amount).toLocaleString()}</span></div>
      <div class="info-row"><span class="info-label">Invoice No.</span><span class="info-value">${invoiceNumber}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="badge badge-yellow">Under Review</span></div>
    </div>
    <p>Our team will review your enrollment within <strong style="color:#fff">24 working hours</strong>. You will receive login credentials once approved.</p>
    <div class="warning-box"><p>📌 Do not share your payment screenshot with anyone other than our official team.</p></div>
  `),
});

// 3. Approval + credentials email
const studentApprovalWithCredentials = ({ studentName, courseName, email, tempPassword, startDate, expiresAt, validityMonths, portalUrl }) => ({
  subject: `🎓 Enrollment Approved! Your Login Credentials — ${courseName}`,
  html: emailBase(`
    <div class="success-icon">🎓</div>
    <h1>Enrollment Approved!</h1>
    <p>Dear <strong style="color:#fff">${studentName}</strong>,</p>
    <p>Congratulations! Your enrollment in <span class="highlight">${courseName}</span> has been <strong class="highlight">approved</strong>. You can now access the course portal.</p>

    <h2>🔑 Your Login Credentials</h2>
    <div class="creds-box">
      <div class="cred-item"><span class="cred-key">Portal URL: </span><span class="cred-val">${portalUrl}</span></div>
      <div class="cred-item"><span class="cred-key">Email: </span><span class="cred-val">${email}</span></div>
      <div class="cred-item"><span class="cred-key">Password: </span><span class="cred-val">${tempPassword}</span></div>
    </div>
    <div class="warning-box"><p>⚠️ Please change your password immediately after first login for security.</p></div>

    <h2>📅 Course Details</h2>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Course</span><span class="info-value">${courseName}</span></div>
      <div class="info-row"><span class="info-label">Start Date</span><span class="info-value">${startDate}</span></div>
      <div class="info-row"><span class="info-label">Valid Until</span><span class="info-value highlight">${expiresAt}</span></div>
      <div class="info-row"><span class="info-label">Duration</span><span class="info-value">${validityMonths} months</span></div>
    </div>

    <a href="${portalUrl}" class="btn">Access Course Portal →</a>
    <p>Need help? WhatsApp us at <span class="highlight">+91 98765 43210</span> or email support@cybertech.com</p>
  `),
});

// 4. Rejection email
const studentRejectionEmail = ({ studentName, courseName, reason, refundInfo }) => ({
  subject: `❌ Enrollment Update — ${courseName} | CyberTech Institute`,
  html: emailBase(`
    <h1>Enrollment Update</h1>
    <p>Dear <strong style="color:#fff">${studentName}</strong>,</p>
    <p>After reviewing your enrollment for <span class="highlight">${courseName}</span>, we regret to inform you that it has been <span style="color:#FF3366;font-weight:700">not approved</span> at this time.</p>
    ${reason ? `
    <div class="info-box">
      <div class="info-row"><span class="info-label">Reason</span><span class="info-value">${reason}</span></div>
    </div>` : ''}
    <p>${refundInfo || 'Your payment will be refunded within 5–7 business days to your original payment method.'}</p>
    <p>If you believe this is an error or need assistance, please contact us immediately.</p>
    <a href="https://wa.me/919876543210" class="btn-outline">Contact Support →</a>
    <p style="margin-top:20px">We apologize for any inconvenience and hope to assist you in the future.</p>
  `),
});

// 5. Expiry warning (sent 7 days before)
const expiryWarningEmail = ({ studentName, courseName, expiresAt, renewUrl }) => ({
  subject: `⚠️ Course Expiring in 7 Days — ${courseName}`,
  html: emailBase(`
    <div class="success-icon">⏳</div>
    <h1>Your Course is Expiring Soon</h1>
    <p>Dear <strong style="color:#fff">${studentName}</strong>,</p>
    <p>Your access to <span class="highlight">${courseName}</span> will expire on <strong style="color:#FF3366">${expiresAt}</strong>.</p>
    <p>Renew now to retain access to all course materials, recordings, and labs.</p>
    <a href="${renewUrl || process.env.CLIENT_URL + '/courses'}" class="btn">Renew Access →</a>
  `),
});

// ── Core send function ────────────────────────────────────────
async function sendEmail({ to, subject, html, type, enrollmentId, userId }) {
  const logEntry = { to, subject, type, enrollment: enrollmentId, user: userId };

  try {
    const transporter = createTransporter();

    if (!transporter) {
      // Log to console in dev when no transporter configured
      console.log('\n📧 ═══════════ EMAIL (console mode) ═══════════');
      console.log(`  To:      ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Type:    ${type}`);
      console.log('═══════════════════════════════════════════════\n');
      await EmailLog.create({ ...logEntry, status: 'sent', error: 'Console-only mode' });
      return { success: true, mode: 'console' };
    }

    await transporter.sendMail({
      from: `"CyberTech Institute" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'no-reply@cybertech.com'}>`,
      to,
      subject,
      html,
    });

    await EmailLog.create({ ...logEntry, status: 'sent' });
    console.log(`📧 Email sent → ${to} [${type}]`);
    return { success: true };

  } catch (err) {
    console.error(`📧 Email failed → ${to}:`, err.message);
    await EmailLog.create({ ...logEntry, status: 'failed', error: err.message });
    return { success: false, error: err.message };
  }
}

// ── Exported helper functions ─────────────────────────────────
module.exports = {
  sendAdminPaymentNotification: (data, enrollmentId) =>
    sendEmail({ ...adminPaymentNotification(data), to: process.env.ADMIN_EMAIL || 'admin@cybertech.com', type: 'admin_notification', enrollmentId }),

  sendStudentPaymentConfirmation: (data, to, enrollmentId, userId) =>
    sendEmail({ ...studentPaymentConfirmation(data), to, type: 'payment_received', enrollmentId, userId }),

  sendApprovalWithCredentials: (data, to, enrollmentId, userId) =>
    sendEmail({ ...studentApprovalWithCredentials(data), to, type: 'approval', enrollmentId, userId }),

  sendRejectionEmail: (data, to, enrollmentId, userId) =>
    sendEmail({ ...studentRejectionEmail(data), to, type: 'rejection', enrollmentId, userId }),

  sendExpiryWarning: (data, to, enrollmentId, userId) =>
    sendEmail({ ...expiryWarningEmail(data), to, type: 'expiry_warning', enrollmentId, userId }),
};
