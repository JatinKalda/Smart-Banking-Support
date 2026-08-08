/**
 * Notification Service
 * Centralized notification management for Email, SMS, and In-app notifications
 */

const emailService = require('./email-service');
const smsService = require('./sms-service');
const pool = require('../db-mysql');

class NotificationService {
    /**
     * Create notification record in database
     */
    async logNotification(userId, type, title, message, metadata = {}) {
        try {
            const sql = `
                INSERT INTO notifications (userId, type, title, message, metadata, createdAt)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            
            await pool.query(sql, [
                userId,
                type,
                title,
                message,
                JSON.stringify(metadata)
            ]);
            
            console.log(`✅ Notification logged for user ${userId}`);
        } catch (error) {
            console.error('Error logging notification:', error);
        }
    }

    /**
     * Get user preferences
     */
    async getUserPreferences(userId) {
        try {
            const sql = `
                SELECT 
                    email, phone,
                    emailNotifications, smsNotifications, pushNotifications,
                    email2fa, sms2fa
                FROM users WHERE id = ?
            `;
            
            const [rows] = await pool.query(sql, [userId]);
            return rows[0] || {};
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return {};
        }
    }

    /**
     * Send Welcome Notification
     */
    async sendWelcomeNotification(user) {
        const prefs = await this.getUserPreferences(user.id);
        
        // Email
        if (prefs.emailNotifications) {
            await emailService.sendWelcomeEmail(user);
        }
        
        // Log notification
        await this.logNotification(user.id, 'in-app', 'Welcome!', 'Welcome to HSBC Banking Platform', {
            action: 'welcome'
        });
    }

    /**
     * Send Transaction Notification
     */
    async sendTransactionNotification(user, transaction) {
        const prefs = await this.getUserPreferences(user.id);
        
        const title = `${transaction.type.toUpperCase()} - $${transaction.amount.toFixed(2)}`;
        const message = transaction.description;
        
        // Email
        if (prefs.emailNotifications) {
            await emailService.sendTransactionEmail(user, transaction);
        }
        
        // SMS
        if (prefs.smsNotifications && prefs.phone && transaction.amount > 500) {
            await smsService.sendTransactionAlertSMS(prefs.phone, transaction);
        }
        
        // In-app
        await this.logNotification(user.id, 'in-app', title, message, {
            type: 'transaction',
            transactionId: transaction.id,
            amount: transaction.amount
        });
    }

    /**
     * Send 2FA Code
     */
    async send2FANotification(user, code) {
        const prefs = await this.getUserPreferences(user.id);
        
        // Email (primary)
        if (prefs.email2fa) {
            await emailService.send2FAEmailCode(user.email, code);
        }
        
        // SMS (secondary)
        if (prefs.sms2fa && prefs.phone) {
            await smsService.send2FASMSCode(prefs.phone, code);
        }
        
        // Log
        await this.logNotification(user.id, 'in-app', '2FA Code Sent', 'Your 2FA code has been sent', {
            type: '2fa'
        });
    }

    /**
     * Send Card Alert
     */
    async sendCardAlertNotification(user, cardType, action, details = {}) {
        const prefs = await this.getUserPreferences(user.id);
        
        const title = `Card ${action}: ${cardType}`;
        
        // Email
        if (prefs.emailNotifications) {
            await emailService.sendCardAlertEmail(user, cardType, action, details);
        }
        
        // SMS
        if (prefs.smsNotifications && prefs.phone) {
            await smsService.sendCardAlertSMS(prefs.phone, cardType, action, details.lastFour || 'Unknown');
        }
        
        // In-app
        await this.logNotification(user.id, 'in-app', title, `Your ${cardType} card has been ${action}`, {
            type: 'card',
            cardType,
            action,
            ...details
        });
    }

    /**
     * Send Low Balance Alert
     */
    async sendLowBalanceNotification(user, currentBalance, threshold) {
        const prefs = await this.getUserPreferences(user.id);
        
        // SMS (urgent)
        if (prefs.smsNotifications && prefs.phone) {
            await smsService.sendLowBalanceAlertSMS(prefs.phone, currentBalance, threshold);
        }
        
        // Email
        if (prefs.emailNotifications) {
            const html = `
                <h2>Low Balance Alert</h2>
                <p>Your account balance is below the threshold.</p>
                <p><strong>Current Balance:</strong> $${currentBalance.toFixed(2)}</p>
                <p><strong>Threshold:</strong> $${threshold.toFixed(2)}</p>
            `;
            await emailService.sendEmail(user.email, '⚠️ Low Balance Alert', html);
        }
        
        // In-app
        await this.logNotification(user.id, 'in-app', '⚠️ Low Balance', `Your balance is below $${threshold.toFixed(2)}`, {
            type: 'lowBalance',
            currentBalance,
            threshold
        });
    }

    /**
     * Send Login Alert
     */
    async sendLoginAlertNotification(user, location, device) {
        const prefs = await this.getUserPreferences(user.id);
        
        // SMS
        if (prefs.smsNotifications && prefs.phone) {
            await smsService.sendLoginAlertSMS(prefs.phone, location, device);
        }
        
        // Email
        if (prefs.emailNotifications) {
            const html = `
                <h2>New Login Detected</h2>
                <p>A new login to your account was detected.</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Device:</strong> ${device}</p>
                <p>If this wasn't you, please change your password immediately.</p>
            `;
            await emailService.sendEmail(user.email, '🔐 New Login Alert', html);
        }
        
        // In-app
        await this.logNotification(user.id, 'in-app', '🔐 New Login', `Login from ${location}`, {
            type: 'login',
            location,
            device
        });
    }

    /**
     * Send Bill Payment Reminder
     */
    async sendBillReminderNotification(user, billAmount, dueDate) {
        const prefs = await this.getUserPreferences(user.id);
        
        // SMS
        if (prefs.smsNotifications && prefs.phone) {
            await smsService.sendBillReminderSMS(prefs.phone, billAmount, dueDate);
        }
        
        // Email
        if (prefs.emailNotifications) {
            const html = `
                <h2>Bill Payment Reminder</h2>
                <p><strong>Amount:</strong> $${billAmount.toFixed(2)}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p>Pay now to avoid late fees.</p>
            `;
            await emailService.sendEmail(user.email, '💳 Bill Payment Reminder', html);
        }
        
        // In-app
        await this.logNotification(user.id, 'in-app', '💳 Bill Reminder', `Payment due: $${billAmount.toFixed(2)}`, {
            type: 'billReminder',
            billAmount,
            dueDate
        });
    }

    /**
     * Get all notifications for user
     */
    async getNotifications(userId, limit = 20) {
        try {
            const sql = `
                SELECT * FROM notifications
                WHERE userId = ?
                ORDER BY createdAt DESC
                LIMIT ?
            `;
            
            const [rows] = await pool.query(sql, [userId, limit]);
            return rows;
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            const sql = `
                UPDATE notifications
                SET isRead = TRUE
                WHERE id = ?
            `;
            
            await pool.query(sql, [notificationId]);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read for user
     */
    async markAllAsRead(userId) {
        try {
            const sql = `
                UPDATE notifications
                SET isRead = TRUE
                WHERE userId = ? AND isRead = FALSE
            `;
            
            await pool.query(sql, [userId]);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId) {
        try {
            const sql = `DELETE FROM notifications WHERE id = ?`;
            await pool.query(sql, [notificationId]);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    /**
     * Update user notification preferences
     */
    async updatePreferences(userId, preferences) {
        try {
            const updates = [];
            const values = [];
            
            if (preferences.emailNotifications !== undefined) {
                updates.push('emailNotifications = ?');
                values.push(preferences.emailNotifications);
            }
            if (preferences.smsNotifications !== undefined) {
                updates.push('smsNotifications = ?');
                values.push(preferences.smsNotifications);
            }
            if (preferences.pushNotifications !== undefined) {
                updates.push('pushNotifications = ?');
                values.push(preferences.pushNotifications);
            }
            if (preferences.email2fa !== undefined) {
                updates.push('email2fa = ?');
                values.push(preferences.email2fa);
            }
            if (preferences.sms2fa !== undefined) {
                updates.push('sms2fa = ?');
                values.push(preferences.sms2fa);
            }
            if (preferences.phone !== undefined) {
                updates.push('phone = ?');
                values.push(preferences.phone);
            }
            
            if (updates.length === 0) return;
            
            values.push(userId);
            const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            
            await pool.query(sql, values);
            console.log(`✅ User ${userId} preferences updated`);
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }

    /**
     * Send notification to multiple users (batch)
     */
    async sendBatchNotification(userIds, title, message, type = 'in-app') {
        try {
            for (const userId of userIds) {
                await this.logNotification(userId, type, title, message, {
                    batch: true
                });
            }
            console.log(`✅ Batch notification sent to ${userIds.length} users`);
        } catch (error) {
            console.error('Error sending batch notification:', error);
        }
    }
}

module.exports = new NotificationService();
