const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Normalize Indian mobile numbers to a plain 10-digit string.
 * Accepts: 9876543210, +919876543210, 91XXXXXXXXXX, with spaces/dashes.
 */
function normalizeIndianPhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10) return null;
  return digits;
}

/**
 * Send SMS via Fast2SMS Quick SMS (route "q") — works on most free/dev plans.
 */
const sendSMS = async (mobileNumber, message) => {
  const phone = normalizeIndianPhone(mobileNumber);
  if (!phone) {
    throw new Error(
      'Invalid mobile number. Use a valid 10-digit Indian number (e.g. 9876543210).'
    );
  }

  const text = String(message || '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // strip emojis (some SMS routes reject them)
    .trim()
    .slice(0, 750);

  if (!text) {
    throw new Error('Message cannot be empty.');
  }

  if (!FAST2SMS_API_KEY) {
    throw new Error(
      'Fast2SMS API key is not configured. Set FAST2SMS_API_KEY in server/.env'
    );
  }

  // Prefer Quick SMS route first (most reliable for personal/dev keys)
  const attempts = [
    {
      name: 'quick',
      payload: {
        route: 'q',
        message: text,
        language: 'english',
        flash: 0,
        numbers: phone,
      },
    },
    {
      name: 'quick-v3',
      payload: {
        route: 'v3',
        sender_id: 'FSTSMS',
        message: text,
        language: 'english',
        flash: 0,
        numbers: phone,
      },
    },
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      console.log(`[SMS] Trying ${attempt.name} → ${phone}`);
      const response = await axios.post(FAST2SMS_URL, attempt.payload, {
        headers: {
          authorization: FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      console.log(`[SMS] Response (${attempt.name}):`, response.data);

      if (response.data && response.data.return === true) {
        return {
          success: true,
          messageId: response.data.request_id,
          route: attempt.payload.route,
          message: 'SMS sent successfully',
          phone,
        };
      }

      const errorMessage =
        (Array.isArray(response.data?.message)
          ? response.data.message.join(', ')
          : response.data?.message) ||
        response.data?.error ||
        'Unknown Fast2SMS error';
      lastError = new Error(errorMessage);
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        const msg =
          (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ||
          data?.error ||
          error.message;
        console.error(`[SMS] ${attempt.name} failed:`, error.response.status, data);
        lastError = new Error(msg);

        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Fast2SMS API key is invalid or blocked. Check FAST2SMS_API_KEY.');
        }
        if (error.response.status === 402) {
          throw new Error('Fast2SMS wallet balance is empty. Recharge at fast2sms.com');
        }
      } else {
        console.error(`[SMS] ${attempt.name} network error:`, error.message);
        lastError = error;
      }
    }
  }

  throw lastError || new Error('All SMS routes failed');
};

const sendReminderSMS = async (mobileNumber, userName, reminderMessage, reminderDate) => {
  const formattedDate = new Date(reminderDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `Hello ${userName || 'Farmer'}! Farm.co Reminder: ${reminderMessage}. Time: ${formattedDate}`;
  return sendSMS(mobileNumber, message);
};

const sendCropScheduleSMS = async (mobileNumber, userName, cropName, reminderCount) => {
  const message = `Hello ${userName || 'Farmer'}! Farm.co: Crop schedule for ${cropName} created with ${reminderCount} reminders.`;
  return sendSMS(mobileNumber, message);
};

module.exports = {
  sendSMS,
  sendReminderSMS,
  sendCropScheduleSMS,
  normalizeIndianPhone,
};
