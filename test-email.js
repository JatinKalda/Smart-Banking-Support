/**
 * Quick Test Script for Email Service
 * Run after: npm install nodemailer dotenv
 * Configure: Fill in .env with email provider credentials
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();
const emailService = require('./services/email-service');

async function runTests() {
    console.log('🧪 Email Service Test Suite');
    console.log('═══════════════════════════════════════\n');

    // Test 1: Generic email
    console.log('Test 1️⃣  - Sending generic email...');
    try {
        const testEmail = process.env.TEST_EMAIL || 'test@example.com';
        await emailService.sendEmail(
            testEmail,
            'HSBC Bank - Test Email',
            '<h1>Hello!</h1><p>This is a test email from HSBC Bank system.</p>'
        );
        console.log('✅ Generic email test PASSED\n');
    } catch (error) {
        console.error('❌ Generic email test FAILED:', error.message, '\n');
    }

    // Test 2: Welcome email
    console.log('Test 2️⃣  - Sending welcome email...');
    try {
        await emailService.sendWelcomeEmail(
            'newuser@example.com',
            'John Doe',
            'john.doe'
        );
        console.log('✅ Welcome email test PASSED\n');
    } catch (error) {
        console.error('❌ Welcome email test FAILED:', error.message, '\n');
    }

    // Test 3: 2FA email code
    console.log('Test 3️⃣  - Sending 2FA email code...');
    try {
        await emailService.send2FAEmailCode('user@example.com', '123456');
        console.log('✅ 2FA email test PASSED\n');
    } catch (error) {
        console.error('❌ 2FA email test FAILED:', error.message, '\n');
    }

    // Test 4: Transaction email
    console.log('Test 4️⃣  - Sending transaction email...');
    try {
        const transaction = {
            id: 'TXN123456',
            amount: 5000,
            type: 'credit',
            description: 'Salary deposit',
            timestamp: new Date().toISOString()
        };
        await emailService.sendTransactionEmail('user@example.com', 'John Doe', transaction);
        console.log('✅ Transaction email test PASSED\n');
    } catch (error) {
        console.error('❌ Transaction email test FAILED:', error.message, '\n');
    }

    // Test 5: Card alert email
    console.log('Test 5️⃣  - Sending card alert email...');
    try {
        await emailService.sendCardAlertEmail(
            'user@example.com',
            '1234',
            {
                amount: 50000,
                merchant: 'Amazon',
                timestamp: new Date().toISOString()
            }
        );
        console.log('✅ Card alert email test PASSED\n');
    } catch (error) {
        console.error('❌ Card alert email test FAILED:', error.message, '\n');
    }

    // Test 6: Password reset email
    console.log('Test 6️⃣  - Sending password reset email...');
    try {
        await emailService.sendPasswordResetEmail(
            'user@example.com',
            'https://hsbc-bank.local/reset/abc123xyz'
        );
        console.log('✅ Password reset email test PASSED\n');
    } catch (error) {
        console.error('❌ Password reset email test FAILED:', error.message, '\n');
    }

    // Test 7: Monthly statement
    console.log('Test 7️⃣  - Sending monthly statement email...');
    try {
        const statement = {
            transactions: 15,
            totalDebit: 25000,
            totalCredit: 50000,
            closingBalance: 100000,
            month: 'February 2026'
        };
        await emailService.sendMonthlyStatementEmail('user@example.com', 'John Doe', statement);
        console.log('✅ Monthly statement email test PASSED\n');
    } catch (error) {
        console.error('❌ Monthly statement email test FAILED:', error.message, '\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Email Service Test Complete!');
    console.log('═══════════════════════════════════════\n');

    // Show configuration info
    console.log('📋 Current Configuration:');
    console.log(`Email Provider: ${process.env.EMAIL_PROVIDER || 'Not set'}`);
    console.log(`Service Status: ${process.env.EMAIL_PROVIDER ? '✅ Configured' : '❌ Not configured'}\n`);

    console.log('💡 Next Steps:');
    console.log('1. Check if all tests passed');
    console.log('2. If any failed, check .env credentials');
    console.log('3. Restart server: node server-mysql.js');
    console.log('4. Integration points ready in:');
    console.log('   - POST /api/auth/signup (welcome email)');
    console.log('   - POST /api/transactions (transaction email)');
    console.log('   - POST /api/2fa (2FA email code)\n');

    process.exit(0);
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
