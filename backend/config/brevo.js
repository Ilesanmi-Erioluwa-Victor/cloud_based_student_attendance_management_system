const axios = require('axios');

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
});

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    const response = await brevoClient.post('/smtp/email', {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'Attendance System',
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    });
    return response.data;
  } catch (error) {
    console.error('Brevo email error:', error.response?.data || error.message);
    throw error;
  }
};

const sendLowAttendanceAlert = async (studentEmail, studentName, courseCode, percentage) => {
  return sendEmail({
    to: studentEmail,
    subject: `Low Attendance Alert - ${courseCode}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Low Attendance Warning</h2>
        <p>Dear ${studentName},</p>
        <p>Your attendance in <strong>${courseCode}</strong> has fallen to <strong style="color: #dc2626;">${percentage}%</strong>, which is below the required 75% threshold.</p>
        <p>Please make every effort to attend remaining classes to avoid being barred from examinations.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Attendance Management System</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendLowAttendanceAlert };
