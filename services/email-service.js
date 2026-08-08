/**
 * Email Service Configuration
 * Supports multiple providers: Gmail SMTP, Sendgrid, Mailgun
 * 
 * Setup:
 * 1. npm install nodemailer dotenv
 * 2. Create .env file with EMAIL_USER and EMAIL_PASSWORD
 * 3. Use sendEmail() function in your routes
 */

let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (error) {
    console.warn('nodemailer not installed — email sending disabled');
}

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../email-templates');
if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
}

let transporter = null;
const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

function initTransporter() {
    if (!nodemailer || transporter) return transporter;
    if (!process.env.EMAIL_USER && !process.env.SENDGRID_API_KEY && !process.env.MAILGUN_API_KEY) {
        return null;
    }
    try {
        if (emailProvider === 'gmail' && process.env.EMAIL_USER) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        } else if (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
            const sgTransport = require('nodemailer-sendgrid-transport');
            transporter = nodemailer.createTransport(sgTransport({
                auth: { api_key: process.env.SENDGRID_API_KEY }
            }));
        } else if (emailProvider === 'mailgun' && process.env.MAILGUN_API_KEY) {
            const mg = require('nodemailer-mailgun-transport');
            transporter = nodemailer.createTransport(mg({
                auth: {
                    api_key: process.env.MAILGUN_API_KEY,
                    domain: process.env.MAILGUN_DOMAIN
                }
            }));
        }
    } catch (error) {
        console.warn('Email transporter init failed:', error.message);
    }
    return transporter;
}

async function deliverEmail(options) {
    const mailer = initTransporter();
    if (!mailer) {
        console.log(`📧 [dev] Email to ${options.to}: ${options.subject}`);
        return { success: true, dev: true };
    }
    await mailer.sendMail(options);
    return { success: true };
}

/**
 * Generator for 2FA OTP Code
 */
function generate2FACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send Welcome Email
 */
async function sendWelcomeEmail(user) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .header { background: linear-gradient(135deg, #0f9ad6 0%, #0a7fa1 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
                .content { padding: 20px 0; }
                .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                .btn { background: #0f9ad6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to HSBC Banking! 🏦</h1>
                </div>
                <div class="content">
                    <p>Hi <strong>${user.firstName} ${user.lastName}</strong>,</p>
                    <p>Welcome to our secure banking platform! Your account has been successfully created.</p>
                    
                    <h3>Next Steps:</h3>
                    <ul>
                        <li>Complete your profile information</li>
                        <li>Enable Two-Factor Authentication (2FA)</li>
                        <li>Add your payment cards</li>
                        <li>Set up your account preferences</li>
                    </ul>
                    
                    <a href="${process.env.SITE_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
                    
                    <p><strong>Account Details:</strong></p>
                    <ul>
                        <li>Email: ${user.email}</li>
                        <li>Role: ${user.role}</li>
                        <li>Created: ${new Date(user.createdAt).toLocaleDateString()}</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>&copy; 2026 HSBC Bank. All rights reserved.</p>
                    <p>If you did not create this account, please contact support immediately.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: user.email,
            subject: `Welcome to HSBC Banking, ${user.firstName}! 🎉`,
            html: html
        });
        console.log(`✅ Welcome email sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send 2FA Code via Email
 */
async function send2FAEmailCode(email, code) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .header { background: #ff6b6b; color: white; padding: 20px; border-radius: 5px; text-align: center; }
                .code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f9ad6; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; color: #856404; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Two-Factor Authentication Code</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hi,</p>
                    <p>Your 2FA verification code is:</p>
                    <div class="code">${code}</div>
                    <p><strong>This code will expire in 10 minutes.</strong></p>
                    <div class="warning">
                        <strong>⚠️ Security Warning:</strong> Never share this code with anyone. HSBC will never ask for your 2FA code.
                    </div>
                    <p>If you did not request this code, your account may be under threat. Please change your password immediately.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: email,
            subject: '🔐 Your HSBC 2FA Code',
            html: html
        });
        console.log(`✅ 2FA email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending 2FA email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send Transaction Confirmation Email
 */
async function sendTransactionEmail(user, transaction) {
    const icons = {
        credit: '📥',
        debit: '📤',
        transfer: '🔄',
        payment: '💰'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .header { background: #1a1a2e; color: white; padding: 20px; border-radius: 5px; }
                .transaction-box { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0f9ad6; }
                .amount { font-size: 24px; font-weight: bold; color: #0f9ad6; }
                .status { display: inline-block; padding: 5px 10px; border-radius: 3px; background: #d4edda; color: #155724; text-transform: uppercase; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${icons[transaction.type] || '💳'} Transaction Confirmation</h1>
                    <p>Reference: #${transaction.id}</p>
                </div>
                
                <div class="transaction-box">
                    <p><strong>Transaction Type:</strong> ${transaction.type.toUpperCase()}</p>
                    <p><strong>Description:</strong> ${transaction.description}</p>
                    <p><strong>Amount:</strong> <span class="amount">$${transaction.amount.toFixed(2)}</span></p>
                    <p><strong>Status:</strong> <span class="status">${transaction.status}</span></p>
                    <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    <p><strong>Balance After:</strong> $${transaction.balanceAfter?.toFixed(2) || 'N/A'}</p>
                </div>
                
                <p>If you didn't authorize this transaction, please contact our support team immediately.</p>
                <p>Thank you for banking with HSBC! 🏦</p>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: user.email,
            subject: `${icons[transaction.type]} Transaction Confirmation - $${transaction.amount.toFixed(2)}`,
            html: html
        });
        console.log(`✅ Transaction email sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending transaction email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send Card Alert Email
 */
async function sendCardAlertEmail(user, cardType, action, details = {}) {
    const actionMessages = {
        blocked: '🚫 blocked',
        unblocked: '✓ unblocked',
        expired: '⏰ expired',
        limited: '⚙️ limits changed'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .alert-header { background: #ff6b6b; color: white; padding: 20px; border-radius: 5px; text-align: center; }
                .details { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="alert-header">
                    <h1>💳 Card Alert</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Hi ${user.firstName},</p>
                    <p>Your <strong>${cardType}</strong> card has been <strong>${actionMessages[action] || action}</strong>.</p>
                    
                    <div class="details">
                        <p><strong>Action Taken:</strong> ${action}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        ${details.lastFour ? `<p><strong>Card:</strong> •••• •••• •••• ${details.lastFour}</p>` : ''}
                        ${details.newLimit ? `<p><strong>New Limit:</strong> $${details.newLimit}</p>` : ''}
                    </div>
                    
                    <p>If you did not request this action, please contact us immediately at support@hsbc.com or call 1-800-HSBC-NOW.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: user.email,
            subject: `🚨 Card Alert: ${cardType} ${actionMessages[action]}`,
            html: html
        });
        console.log(`✅ Card alert email sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending card alert email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send Password Reset Email
 */
async function sendPasswordResetEmail(user, resetLink) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .header { background: #0f9ad6; color: white; padding: 20px; border-radius: 5px; text-align: center; }
                .btn { background: #0f9ad6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; color: #856404; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Hi ${user.firstName},</p>
                    <p>We received a request to reset your HSBC account password.</p>
                    
                    <a href="${resetLink}" class="btn">Reset Password</a>
                    
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Note:</strong> If you did not request this email, please ignore it. Your account remains secure.
                    </div>
                    
                    <p>Questions? Contact support@hsbc.com</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: user.email,
            subject: '🔐 Password Reset Request',
            html: html
        });
        console.log(`✅ Password reset email sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send Monthly Statement Email
 */
async function sendMonthlyStatementEmail(user, statement) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .header { background: #1a1a2e; color: white; padding: 20px; border-radius: 5px; }
                .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
                .stat-box { background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; }
                .amount { font-size: 20px; font-weight: bold; color: #0f9ad6; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Monthly Statement</h1>
                    <p>${statement.month} ${statement.year}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <p>Opening Balance</p>
                        <p class="amount">$${statement.openingBalance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div class="stat-box">
                        <p>Closing Balance</p>
                        <p class="amount">$${statement.closingBalance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div class="stat-box">
                        <p>Total Credits</p>
                        <p class="amount" style="color: #28a745;">$${statement.totalCredit?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div class="stat-box">
                        <p>Total Debits</p>
                        <p class="amount" style="color: #dc3545;">$${statement.totalDebit?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>
                
                <p>View your complete statement details in your account dashboard or download the PDF attachment.</p>
                <p>Thank you for banking with HSBC! 🏦</p>
            </div>
        </body>
        </html>
    `;

    try {
        await deliverEmail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to: user.email,
            subject: `📊 Your HSBC Monthly Statement - ${statement.month} ${statement.year}`,
            html: html
        });
        console.log(`✅ Monthly statement email sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending monthly statement email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generic Email Sender
 */
async function sendEmail(to, subject, html, attachments = []) {
    const mailer = initTransporter();
    if (!mailer) {
        console.log(`📧 [dev] Email to ${to}: ${subject}`);
        return { success: true, dev: true };
    }
    try {
        await mailer.sendMail({
            from: process.env.EMAIL_USER || 'noreply@hsbc.com',
            to,
            subject,
            html,
            attachments
        });
        console.log(`✅ Email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendWelcomeEmail,
    send2FAEmailCode,
    sendTransactionEmail,
    sendCardAlertEmail,
    sendPasswordResetEmail,
    sendMonthlyStatementEmail,
    sendEmail,
    generate2FACode
};
