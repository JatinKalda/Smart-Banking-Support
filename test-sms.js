/**
 * Quick Test Script for SMS Service
 * Run after: npm install twilio dotenv
 * Configure: Fill in .env with SMS provider credentials
 * 
 * Usage: node test-sms.js
 */

require('dotenv').config();
const smsService = require('./services/sms-service');

async function runTests() {
    console.log('🧪 SMS Service Test Suite');
    console.log('═══════════════════════════════════════\n');

    // Get test phone number from env or use default
    const testPhone = process.env.TEST_PHONE || '+1234567890';

    console.log(`📱 Using test phone: ${testPhone}\n`);

    // Test 1: Generic SMS
    console.log('Test 1️⃣  - Sending generic SMS...');
    try {
        await smsService.sendSMS(
            testPhone,
            'Hello! This is a test SMS from HSBC Bank system.'
        );
        console.log('✅ Generic SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Generic SMS test FAILED:', error.message, '\n');
    }

    // Test 2: 2FA SMS code
    console.log('Test 2️⃣  - Sending 2FA SMS code...');
    try {
        await smsService.send2FASMSCode(testPhone, '654321');
        console.log('✅ 2FA SMS test PASSED\n');
    } catch (error) {
        console.error('❌ 2FA SMS test FAILED:', error.message, '\n');
    }

    // Test 3: Transaction alert SMS
    console.log('Test 3️⃣  - Sending transaction alert SMS...');
    try {
        await smsService.sendTransactionAlertSMS(
            testPhone,
            {
                amount: 5000,
                type: 'credit',
                account: 'Salary Deposit',
                balance: 100000
            }
        );
        console.log('✅ Transaction alert SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Transaction alert SMS test FAILED:', error.message, '\n');
    }

    // Test 4: Card alert SMS
    console.log('Test 4️⃣  - Sending card alert SMS...');
    try {
        await smsService.sendCardAlertSMS(
            testPhone,
            {
                amount: 50000,
                merchant: 'Amazon',
                cardLast4: '1234'
            }
        );
        console.log('✅ Card alert SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Card alert SMS test FAILED:', error.message, '\n');
    }

    // Test 5: Low balance alert SMS
    console.log('Test 5️⃣  - Sending low balance alert SMS...');
    try {
        await smsService.sendLowBalanceAlertSMS(
            testPhone,
            {
                balance: 5000,
                threshold: 10000
            }
        );
        console.log('✅ Low balance alert SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Low balance alert SMS test FAILED:', error.message, '\n');
    }

    // Test 6: Login alert SMS
    console.log('Test 6️⃣  - Sending login alert SMS...');
    try {
        await smsService.sendLoginAlertSMS(
            testPhone,
            {
                device: 'Chrome on Windows',
                location: 'New York, NY',
                time: new Date().toLocaleString()
            }
        );
        console.log('✅ Login alert SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Login alert SMS test FAILED:', error.message, '\n');
    }

    // Test 7: OTP SMS
    console.log('Test 7️⃣  - Sending OTP SMS...');
    try {
        await smsService.sendOTPSMS(testPhone, '789123');
        console.log('✅ OTP SMS test PASSED\n');
    } catch (error) {
        console.error('❌ OTP SMS test FAILED:', error.message, '\n');
    }

    // Test 8: Bill reminder SMS
    console.log('Test 8️⃣  - Sending bill reminder SMS...');
    try {
        await smsService.sendBillReminderSMS(
            testPhone,
            {
                billName: 'Electricity Bill',
                amount: 2500,
                dueDate: '2026-03-05'
            }
        );
        console.log('✅ Bill reminder SMS test PASSED\n');
    } catch (error) {
        console.error('❌ Bill reminder SMS test FAILED:', error.message, '\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ SMS Service Test Complete!');
    console.log('═══════════════════════════════════════\n');

    // Show configuration info
    console.log('📋 Current Configuration:');
    console.log(`SMS Provider: ${process.env.SMS_PROVIDER || 'Not set'}`);
    console.log(`Service Status: ${process.env.SMS_PROVIDER ? '✅ Configured' : '❌ Not configured'}\n`);

    console.log('💡 Next Steps:');
    console.log('1. Check if all tests passed');
    console.log('2. If any failed, check .env credentials');
    console.log('3. Verify phone number format: +1234567890');
    console.log('4. Check SMS provider account balance');
    console.log('5. Restart server: node server-mysql.js');
    console.log('6. Integration points ready in:');
    console.log('   - POST /api/auth/2fa (2FA SMS code)');
    console.log('   - POST /api/transactions (transaction alerts)');
    console.log('   - POST /api/cards (card alerts)\n');

    process.exit(0);
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
