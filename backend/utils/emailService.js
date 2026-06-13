const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = `"Français Pro" <${process.env.SMTP_USER}>`;

/**
 * Sends a booking confirmation email with Google Meet link.
 */
const sendBookingConfirmation = async ({ to, studentName, classTitle, scheduledAt, meetLink, calendarLink }) => {
  const dateStr = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9ff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,35,149,0.08); }
        .header { background: linear-gradient(135deg, #002395, #001875); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .header span { color: #ED2939; }
        .body { padding: 40px; }
        .body h2 { color: #002395; margin-top: 0; }
        .detail-box { background: #f8f9ff; border-left: 4px solid #002395; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .detail-box p { margin: 8px 0; color: #333; }
        .detail-box strong { color: #002395; }
        .meet-btn { display: inline-block; background: #002395; color: white !important; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; margin: 8px 0; }
        .cal-btn { display: inline-block; background: white; color: #002395 !important; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 15px; font-weight: 600; border: 2px solid #002395; margin: 8px 0; }
        .footer { background: #f0f2ff; padding: 24px 40px; text-align: center; color: #666; font-size: 13px; }
        .flag { font-size: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="flag">🇫🇷</div>
          <h1>Français <span>Pro</span></h1>
          <p style="color:#c8d0ff;margin:8px 0 0;">Your live class is confirmed!</p>
        </div>
        <div class="body">
          <h2>Bonjour ${studentName}! 👋</h2>
          <p>Your live French class has been successfully booked. Here are your session details:</p>
          
          <div class="detail-box">
            <p><strong>📚 Class:</strong> ${classTitle}</p>
            <p><strong>📅 Date & Time:</strong> ${dateStr}</p>
            <p><strong>🔗 Google Meet Link:</strong><br>
              <a href="${meetLink}" style="color:#002395;">${meetLink}</a>
            </p>
          </div>

          <p style="text-align:center;">
            <a href="${meetLink}" class="meet-btn">Join Google Meet</a>
          </p>
          ${calendarLink ? `<p style="text-align:center;"><a href="${calendarLink}" class="cal-btn">📅 View in Google Calendar</a></p>` : ''}

          <p style="color:#555;font-size:14px;margin-top:32px;">
            💡 <strong>Tip:</strong> Please join the session 5 minutes early to test your audio and video. 
            The Meet link will be active 10 minutes before the class starts.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Français Pro. Bonne chance! 🍀</p>
          <p>If you have questions, reply to this email or contact us on WhatsApp.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `✅ Booking Confirmed: ${classTitle} — Français Pro`,
    html,
  });
};

/**
 * Sends a reminder email 24 hours before the class.
 */
const sendClassReminder = async ({ to, studentName, classTitle, scheduledAt, meetLink }) => {
  const dateStr = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `⏰ Reminder: "${classTitle}" starts tomorrow — Français Pro`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#002395;">🇫🇷 Class Reminder</h2>
        <p>Bonjour <strong>${studentName}</strong>!</p>
        <p>Your live class <strong>"${classTitle}"</strong> is scheduled for <strong>${dateStr}</strong>.</p>
        <p><a href="${meetLink}" style="background:#002395;color:white;padding:12px 24px;border-radius:50px;text-decoration:none;display:inline-block;margin-top:16px;">Join Google Meet</a></p>
        <p style="color:#555;font-size:13px;margin-top:24px;">See you in class! — The Français Pro Team 🇫🇷</p>
      </div>
    `,
  });
};

/**
 * Sends a cancellation notice to a student.
 */
const sendCancellationNotice = async ({ to, studentName, classTitle, reason }) => {
  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `❌ Class Cancelled: ${classTitle} — Français Pro`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#ED2939;">🇫🇷 Class Cancellation Notice</h2>
        <p>Bonjour <strong>${studentName}</strong>,</p>
        <p>We regret to inform you that <strong>"${classTitle}"</strong> has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you paid for this class, a full refund will be processed within 3-5 business days.</p>
        <p>We apologize for the inconvenience. Please visit our platform to book another session.</p>
        <p style="color:#555;font-size:13px;">— The Français Pro Team</p>
      </div>
    `,
  });
};

module.exports = {
  sendBookingConfirmation,
  sendClassReminder,
  sendCancellationNotice,
};
