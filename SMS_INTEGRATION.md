# SMS Integration with Fast2SMS

## Overview
The Farmer Assistant application now uses Fast2SMS API to send reminder notifications directly to users' mobile numbers instead of email.

## Setup Instructions

### 1. Get Fast2SMS API Key
1. Sign up at [Fast2SMS](https://www.fast2sms.com/)
2. Get your API key from the dashboard
3. Add the API key to your `.env` file:

```env
FAST2SMS_API_KEY=your_fast2sms_api_key_here
```

### 2. Environment Variables
Update your `.env` file in the server directory:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Fast2SMS API Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key_here

# Server Configuration
PORT=5000
```

### 3. Features Implemented

#### Manual Reminders
- Users can create manual reminders with custom messages and dates
- SMS notifications are sent immediately when reminders are created
- Reminders are also sent via cron job when due

#### Crop Schedule Reminders
- Automatic crop schedules create multiple reminders for:
  - Planting reminders
  - Fertilizer application reminders
  - Watering schedule reminders
- SMS notification sent when crop schedule is created
- Individual reminders sent when due

#### Cron Job
- Runs every minute to check for due reminders
- Automatically sends SMS for overdue reminders
- Marks reminders as sent after successful SMS delivery

### 4. SMS Message Format

#### Manual Reminder SMS:
```
Hello [UserName]! 🌾

Reminder: [Reminder Message]
Scheduled: [Date and Time]

Farmer Assistant
```

#### Crop Schedule Creation SMS:
```
Hello [UserName]! 🌱

Crop schedule created for [CropName].
[Number] reminders set up.

Farmer Assistant
```

### 5. Error Handling
- SMS failures don't break the main application flow
- Errors are logged for debugging
- Reminders are still created even if SMS fails
- Retry mechanism can be implemented if needed

### 6. Mobile Number Validation
- Validates 10-digit Indian mobile numbers
- Ensures proper format before sending SMS
- Handles missing or invalid phone numbers gracefully

### 7. API Endpoints Updated
- `POST /api/reminders/add` - Creates manual reminder and sends SMS
- `POST /api/reminders/crop-schedule` - Creates crop schedule and sends SMS
- `POST /api/reminders/test-sms` - Test endpoint for debugging SMS
- Cron job automatically sends SMS for due reminders

### 8. Frontend Updates
- Updated UI to show SMS status instead of email
- Added informational text about SMS delivery
- Status indicators show "SMS Sent" or "Pending SMS"

## Testing

### 1. Test SMS Endpoint
Use the test endpoint to verify your Fast2SMS setup:

```bash
curl -X POST http://localhost:5000/api/reminders/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9398884972",
    "message": "Test SMS from Farmer Assistant"
  }'
```

### 2. Manual Testing
1. Create a test user with a valid mobile number
2. Create a manual reminder
3. Check if SMS is received
4. Create a crop schedule
5. Verify SMS notifications are sent

## Troubleshooting

### Common Error: 400 Bad Request

If you see this error:
```
[CRON] Failed to send SMS for reminder ID: xxx Error: Failed to send SMS: Request failed with status code 400
```

**Possible causes and solutions:**

1. **Invalid API Key**
   - Verify your Fast2SMS API key is correct
   - Check if the API key is active in your Fast2SMS dashboard
   - Ensure the API key has sufficient permissions

2. **Insufficient Balance**
   - Check your Fast2SMS account balance
   - Add funds to your account if needed
   - Error code 402 indicates payment required

3. **Invalid Sender ID**
   - The sender ID "FARMER" might not be approved
   - Contact Fast2SMS support to approve your sender ID
   - Try using a different sender ID (max 6 characters)

4. **Invalid Mobile Number Format**
   - Ensure mobile number is exactly 10 digits
   - Remove any country code or special characters
   - Example: `9398884972` (correct), `+919398884972` (incorrect)

5. **Message Length Issues**
   - SMS messages are limited to 160 characters
   - Check if your message is too long
   - The system automatically truncates messages

6. **API Route Issues**
   - The system uses route 'q' (quick transactional)
   - Ensure this route is enabled for your account
   - Try different routes if available: 'v3', 't', 'p'

### Debugging Steps

1. **Check Environment Variables**
   ```bash
   echo $FAST2SMS_API_KEY
   ```

2. **Test API Key Manually**
   ```bash
   curl -X POST https://www.fast2sms.com/dev/bulkV2 \
     -H "authorization: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "route": "q",
       "sender_id": "FARMER",
       "message": "Test",
       "language": "english",
       "flash": 0,
       "numbers": "9398884972"
     }'
   ```

3. **Check Server Logs**
   - Look for detailed error messages in server console
   - Check for API response details
   - Verify payload being sent

4. **Verify Fast2SMS Account**
   - Login to Fast2SMS dashboard
   - Check account status and balance
   - Verify sender ID approval status
   - Check API usage and limits

### Error Code Reference

- **400**: Bad Request - Check parameters and API key
- **401**: Unauthorized - Invalid API key
- **402**: Payment Required - Insufficient balance
- **403**: Forbidden - API key blocked or invalid
- **429**: Too Many Requests - Rate limit exceeded

## Cost Considerations
- Fast2SMS charges per SMS sent
- Consider implementing rate limiting for cost control
- Monitor SMS usage in Fast2SMS dashboard
- Set up balance alerts to avoid service interruption

## Support
If issues persist:
1. Check Fast2SMS documentation: https://docs.fast2sms.com/
2. Contact Fast2SMS support
3. Review server logs for detailed error information
4. Test with the provided test endpoint 