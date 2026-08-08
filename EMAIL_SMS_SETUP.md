# 📧 Email & SMS Integration Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Email sending
npm install nodemailer dotenv

# SMS sending (choose one)
npm install twilio          # Recommended - $0.0075 per SMS
npm install nexmo           # Alternative - Enterprise option
# OR use AWS SNS (if you already have AWS SDK)
```

### Step 2: Create .env File

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

---

## 📧 Email Setup Guide

### Option 1: Gmail SMTP (Easiest, Free)

**Pros:** Free, simple setup, no API keys needed  
**Cons:** Limited to 500 emails/day, may be flagged as spam

#### Steps:

1. **Enable 2-Step Verification on your Google Account:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"
   - Create an "App Password"

2. **Get App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will give you a 16-character password

3. **Update .env:**
   ```
   EMAIL_PROVIDER=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char password from Google
   ```

4. **Test it:**
   ```javascript
   const emailService = require('./services/email-service');
   emailService.sendEmail('test@example.com', 'Test', '<h1>Hello</h1>');
   ```

---

### Option 2: Sendgrid (Recommended for Production)

**Pros:** 100 emails/day free, scalable, reliable  
**Cons:** Requires API key

#### Steps:

1. **Create Sendgrid Account:**
   - Go to https://sendgrid.com
   - Sign up for free account
   - Email limit: 100/day (free tier)

2. **Get API Key:**
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key (starts with `SG.`)

3. **Update .env:**
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

4. **Install Sendgrid Adapter:**
   ```bash
   npm install nodemailer-sendgrid-transport
   ```

---

### Option 3: Mailgun (Professional)

**Pros:** Powerful, great deliverability, excellent support  
**Cons:** Requires credit card (but free tier exists)

#### Steps:

1. **Create Mailgun Account:**
   - Go to https://mailgun.com
   - Sign up for free

2. **Get Credentials:**
   - Go to Domain Settings
   - Copy API Key and Domain

3. **Update .env:**
   ```
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=key-xxxxxxxxxxxxxx
   MAILGUN_DOMAIN=sandboxxxx.mailgun.org
   ```

4. **Install Mailgun Adapter:**
   ```bash
   npm install nodemailer-mailgun-transport
   ```

---

## 📱 SMS Setup Guide

### Option 1: Twilio (Recommended)

**Cost:** $0.0075 per SMS (very cheap)  
**Free Credit:** $15 after verification

#### Steps:

1. **Create Twilio Account:**
   - Go to https://www.twilio.com/console
   - Sign up and verify phone number
   - Get $15 free credit

2. **Get Phone Number:**
   - Buy a Twilio phone number (+1234567890 format)
   - Cost: ~$1/month

3. **Get Credentials:**
   - Go to Console
   - Find "Account SID" and "Auth Token"
   - Copy them

4. **Update .env:**
   ```
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Test it:**
   ```javascript
   const smsService = require('./services/sms-service');
   smsService.sendSMS('+1234567890', 'Hello from HSBC!');
   ```

---

### Option 2: Nexmo/Vonage (Alternative)

**Cost:** Comparable to Twilio  
**Pros:** Good global coverage

#### Steps:

1. **Create Nexmo Account:**
   - Go to https://dashboard.nexmo.com
   - Sign up and verify

2. **Get Credentials:**
   - API Key (under Account Settings)
   - API Secret

3. **Update .env:**
   ```
   SMS_PROVIDER=nexmo
   NEXMO_API_KEY=xxxxxxxxxxxxxxxx
   NEXMO_API_SECRET=xxxxxxxxxxxxxxxx
   NEXMO_FROM=HSBC
   ```

---

### Option 3: AWS SNS (Enterprise)

**Cost:** $0.00645 per SMS  
**Pros:** Integrated with AWS ecosystem

#### Steps:

1. **Create AWS Account** (if you don't have one)
2. **Create IAM User with SNS permissions**
3. **Get Credentials:**
   - AWS Access Key ID
   - AWS Secret Access Key

4. **Update .env:**
   ```
   SMS_PROVIDER=aws
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

---

## 🔌 Integrating Email/SMS in Your Code

### 1. **Send Welcome Email (on signup)**

```javascript
// In server-mysql.js - after user creation
const { sendWelcomeEmail } = require('./services/email-service');

app.post('/api/signup', async (req, res) => {
    // ... existing signup code ...
    
    // Send welcome email
    await sendWelcomeEmail(newUser);
    
    res.json({ success: true, message: 'Account created! Welcome email sent.' });
});
```

---

### 2. **Send Transaction Notification Email**

```javascript
// In transaction API endpoint
const notificationService = require('./services/notification-service');

app.post('/api/transactions', async (req, res) => {
    // ... create transaction ...
    
    // Send notification
    const user = await getUserById(transaction.userId);
    await notificationService.sendTransactionNotification(user, transaction);
    
    res.json({ success: true, transactionId: transaction.id });
});
```

---

### 3. **Send 2FA Code (Email + SMS)**

```javascript
// In 2FA endpoint
const notificationService = require('./services/notification-service');

app.post('/api/user/send-2fa-code', async (req, res) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    const code = generateOTP();  // 6-digit code
    
    // Save code temporarily (Redis or DB with TTL)
    // Send via Email + SMS based on user preferences
    await notificationService.send2FANotification(user, code);
    
    res.json({ success: true, message: 'Code sent via email & SMS' });
});
```

---

### 4. **Send Card Alert**

```javascript
// When card is blocked
const notificationService = require('./services/notification-service');

app.put('/api/cards/:id/block', async (req, res) => {
    const card = await getCard(req.params.id);
    const user = await getUserById(card.userId);
    
    // Block the card
    // ...
    
    // Send alert
    await notificationService.sendCardAlertNotification(
        user,
        card.cardType,
        'blocked',
        { lastFour: card.lastFour }
    );
    
    res.json({ success: true, message: 'Card blocked' });
});
```

---

### 5. **Send Low Balance Alert**

```javascript
// Check balance periodically
const notificationService = require('./services/notification-service');

async function checkLowBalances() {
    const lowBalanceUsers = await getLowBalanceUsers(threshold = 1000);
    
    for (const user of lowBalanceUsers) {
        await notificationService.sendLowBalanceNotification(
            user,
            user.balance,
            1000
        );
    }
}

// Run every hour
setInterval(checkLowBalances, 60 * 60 * 1000);
```

---

## 📡 Using Notification Center API

### Get All Notifications

```javascript
app.get('/api/notifications', async (req, res) => {
    const { userId } = req.user;
    const notificationService = require('./services/notification-service');
    
    const notifications = await notificationService.getNotifications(userId);
    res.json({ notifications });
});
```

### Mark Notification as Read

```javascript
app.put('/api/notifications/:id/read', async (req, res) => {
    const notificationService = require('./services/notification-service');
    
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true });
});
```

### Update Preferences

```javascript
app.post('/api/user/notification-preferences', async (req, res) => {
    const { userId } = req.user;
    const { emailNotifications, smsNotifications, phone } = req.body;
    
    const notificationService = require('./services/notification-service');
    await notificationService.updatePreferences(userId, {
        emailNotifications,
        smsNotifications,
        phone
    });
    
    res.json({ success: true, message: 'Preferences updated' });
});
```

---

## 🧪 Testing

### Test Email

```javascript
// Create a test file: test-email.js
const emailService = require('./services/email-service');

async function testEmail() {
    const result = await emailService.sendEmail(
        'your-email@example.com',
        'Test Email from HSBC',
        '<h1>This is a test email</h1>'
    );
    console.log('Email result:', result);
}

testEmail();

// Run: node test-email.js
```

### Test SMS

```javascript
// Create a test file: test-sms.js
const smsService = require('./services/sms-service');

async function testSMS() {
    const result = await smsService.sendSMS(
        '+1234567890',  // Your phone number
        'This is a test SMS from HSBC'
    );
    console.log('SMS result:', result);
}

testSMS();

// Run: node test-sms.js
```

---

## ✅ Checklist

- [ ] Create .env file with email credentials
- [ ] Create .env file with SMS credentials
- [ ] Install email service (nodemailer)
- [ ] Install SMS service (twilio/nexmo/aws)
- [ ] Test email sending
- [ ] Test SMS sending
- [ ] Add email notification to signup
- [ ] Add email notification to transactions
- [ ] Add SMS notification for high-value transactions
- [ ] Create notification center API
- [ ] Add notification preferences to settings
- [ ] Test in production

---

## 🐛 Troubleshooting

### Email not sending?

1. **Check .env** - Verify EMAIL_USER and EMAIL_PASSWORD are correct
2. **App Password** - Using Gmail? Make sure it's app password, not regular password
3. **Less Secure Apps** - Gmail blocking? Enable "Less secure app access" (if using SMTP)
4. **Logs** - Check server logs for error messages
5. **Firewall** - Port 587 (SMTP) blocked? Contact your ISP

### SMS not sending?

1. **Phone Number** - Is it in international format? (+1234567890)
2. **Twilio Verified** - Is the phone number added to verified list?
3. **Account Balance** - Do you have enough credit?
4. **Rate Limiting** - Too many SMS? Wait a bit and try again
5. **Logs** - Check Twilio console for detailed error

---

## 📊 Cost Estimates (Monthly)

| Service | Emails | SMS | Cost |
|---------|--------|-----|------|
| Gmail | 500 | N/A | Free |
| Sendgrid | 100 | N/A | Free |
| Twilio SMS | N/A | 1000 | $7.50 |
| Nexmo | N/A | 1000 | $6.45 |
| AWS SNS | N/A | 1000 | $6.45 |

---

## 📚 Resources

- **Nodemailer:** https://nodemailer.com/
- **Twilio SMS:** https://www.twilio.com/messaging/sms
- **Sendgrid:** https://sendgrid.com/
- **Mailgun:** https://mailgun.com/
- **Nexmo:** https://www.nexmo.com/

---

**Status:** Ready to integrate!  
**Next Step:** Choose email and SMS providers, get credentials, update .env file

