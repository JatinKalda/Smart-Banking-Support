/**
 * SMS Service Configuration
 * Supports multiple providers: Twilio, Nexmo, AWS SNS
 * 
 * Setup:
 * 1. npm install twilio (or nexmo)
 * 2. Create .env file with TWILIO_* credentials
 * 3. Use sendSMS() function in your routes
 */

const smsProvider = process.env.SMS_PROVIDER || 'twilio';

let smsClient = null;

function initSmsClient() {
    if (smsClient !== null) return smsClient;
    try {
        if (smsProvider === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
            const twilio = require('twilio');
            smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        } else if (smsProvider === 'nexmo' && process.env.NEXMO_API_KEY) {
            const Nexmo = require('nexmo');
            smsClient = new Nexmo({
                apiKey: process.env.NEXMO_API_KEY,
                apiSecret: process.env.NEXMO_API_SECRET
            });
        } else if (smsProvider === 'aws' && process.env.AWS_ACCESS_KEY_ID) {
            const AWS = require('aws-sdk');
            smsClient = new AWS.SNS({ region: process.env.AWS_REGION || 'us-east-1' });
        }
    } catch (error) {
        console.warn('SMS client init failed:', error.message);
        smsClient = false;
    }
    if (smsClient === null) smsClient = false;
    return smsClient;
}

async function deliverFreeSms(phone, message) {
    try {
        const response = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                number: phone,
                message: message,
                key: 'textbelt' // Use 'textbelt' key for the free tier
            })
        });
        const data = await response.json();
        return { success: data.success };
    } catch (e) {
        console.error('Free Textbelt SMS failed:', e.message);
        return { success: false };
    }
}

async function deliverSms(phone, message) {
    const client = initSmsClient();
    if (!client && smsProvider !== 'textbelt') {
        console.log(`📱 [dev] SMS to ${phone}: ${message}`);
        return { success: true, dev: true };
    }
    if (smsProvider === 'textbelt') {
        const res = await deliverFreeSms(formatPhoneNumber(phone), message);
        if (!res.success) {
            throw new Error('Textbelt sending failed');
        }
    } else if (smsProvider === 'twilio') {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formatPhoneNumber(phone)
        });
    } else if (smsProvider === 'nexmo') {
        await new Promise((resolve, reject) => {
            client.message.sendSms(
                process.env.NEXMO_FROM,
                formatPhoneNumber(phone),
                message,
                (err, res) => (err ? reject(err) : resolve(res))
            );
        });
    } else if (smsProvider === 'aws') {
        await client.publish({
            Message: message,
            PhoneNumber: formatPhoneNumber(phone)
        }).promise();
    }
    console.log(`✅ SMS sent to ${phone}`);
    return { success: true };
}

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it doesn't start with +, assume it's US
    if (!phone.startsWith('+')) {
        if (cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }
    }
    
    return '+' + cleaned;
}

/**
 * Send 2FA Code via SMS
 */
async function send2FASMSCode(phone, code) {
    const message = `Your HSBC 2FA code is: ${code}. Valid for 10 minutes. Never share this code.`;
    try {
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending 2FA SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendTransactionAlertSMS(phone, transaction) {
    try {
        const icons = { credit: '📥', debit: '📤', transfer: '🔄', payment: '💰' };
        const type = transaction?.type || 'transaction';
        const amountVal = parseFloat(transaction?.amount) || 0;
        const desc = transaction?.description || transaction?.account || 'Transaction';
        const balanceAfter = transaction?.balanceAfter !== undefined ? transaction.balanceAfter : transaction?.balance;
        const balanceStr = balanceAfter !== undefined ? ` Balance: $${parseFloat(balanceAfter).toFixed(2)}` : '';
        
        const message = `🏦 HSBC Alert: ${icons[type] || '💳'} ${type.toUpperCase()} of $${amountVal.toFixed(2)} - ${desc}.${balanceStr}`;
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending transaction SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendCardAlertSMS(phone, cardType, action, lastFour) {
    try {
        let typeVal = cardType;
        let actionVal = action;
        let lastFourVal = lastFour;
        if (typeof cardType === 'object' && cardType !== null) {
            typeVal = cardType.cardType || 'card';
            actionVal = cardType.action || 'updated';
            lastFourVal = cardType.cardLast4 || cardType.lastFour || 'xxxx';
        }
        const actionEmojis = { blocked: '🚫', unblocked: '✓', expired: '⏰', limited: '⚙️' };
        const message = `🏦 HSBC Alert: Your ${typeVal} card •••• ${lastFourVal} has been ${actionEmojis[actionVal] || ''} ${actionVal}. Contact us if this wasn't you.`;
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending card alert SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendLowBalanceAlertSMS(phone, currentBalance, threshold) {
    try {
        let balanceVal = currentBalance;
        let thresholdVal = threshold;
        if (typeof currentBalance === 'object' && currentBalance !== null) {
            balanceVal = currentBalance.balance || currentBalance.currentBalance || 0;
            thresholdVal = currentBalance.threshold || 0;
        }
        const message = `🏦 HSBC Alert: Your account balance is low - Current: $${parseFloat(balanceVal).toFixed(2)}. Threshold: $${parseFloat(thresholdVal).toFixed(2)}. Add funds now to avoid overdraft.`;
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending low balance alert SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendLoginAlertSMS(phone, location, device) {
    try {
        let locVal = location;
        let devVal = device;
        if (typeof location === 'object' && location !== null) {
            locVal = location.location || 'Unknown';
            devVal = location.device || 'Unknown device';
        }
        const message = `🏦 HSBC Security: New login detected from ${locVal} on ${devVal}. If this wasn't you, change your password immediately.`;
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending login alert SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendOTPSMS(phone, otp) {
    const message = `Your HSBC account verification OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    try {
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending OTP SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendBillReminderSMS(phone, billAmount, dueDate) {
    try {
        let amountVal = billAmount;
        let dueVal = dueDate;
        let billNameVal = 'Bill';
        if (typeof billAmount === 'object' && billAmount !== null) {
            amountVal = billAmount.amount || billAmount.billAmount || 0;
            dueVal = billAmount.dueDate || '';
            billNameVal = billAmount.billName || 'Bill';
        }
        const message = `🏦 HSBC Reminder: You have a ${billNameVal} payment of $${parseFloat(amountVal).toFixed(2)} due by ${dueVal}. Pay now to avoid late fees.`;
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending bill reminder SMS:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendSMS(phone, message) {
    try {
        return await deliverSms(phone, message);
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    send2FASMSCode,
    sendTransactionAlertSMS,
    sendCardAlertSMS,
    sendLowBalanceAlertSMS,
    sendLoginAlertSMS,
    sendOTPSMS,
    sendBillReminderSMS,
    sendSMS,
    formatPhoneNumber
};
