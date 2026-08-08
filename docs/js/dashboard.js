// Dashboard Logic
class Dashboard {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.transactions = [];
        this.init();
    }

    async init() {
        // Check if user is logged in
        const user = this.getUserFromSession();
        if (!user) {
            window.location.href = '/';
            return;
        }

        this.userId = user.id;
        this.setupEventListeners();
        await this.loadUserData();
        await this.loadTransactions();
    }

    getUserFromSession() {
        // Check sessionStorage first (set during login)
        let userStr = sessionStorage.getItem('user');
        if (!userStr) {
            // Fallback to localStorage
            userStr = localStorage.getItem('currentUser');
        }
        
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation links
        document.querySelectorAll('.navbar-menu .nav-link').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targets = ['', '/cards', '/transfers', '/settings'];
                if (targets[index]) {
                    window.location.href = targets[index];
                }
            });
        });

        // 2FA Modal
        const enable2faBtn = document.getElementById('enable2faBtn');
        const modal = document.getElementById('twoFaModal');
        const modalClose = document.querySelector('.modal-close');

        enable2faBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });

        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // 2FA Method Selection
        const methodRadios = document.querySelectorAll('input[name="2fa-method"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.update2FADisplay();
            });
        });

        // 2FA Step Navigation
        document.getElementById('sendCodeBtn').addEventListener('click', () => {
            this.sendOTPCode();
        });

        document.getElementById('verifyCodeBtn').addEventListener('click', () => {
            this.verify2FA();
        });

        // Quick Actions
        document.querySelectorAll('.action-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const actions = [
                    () => window.location.href = '/transfers',
                    () => window.location.href = '/cards',
                    () => this.downloadStatement()
                ];
                actions[index]?.();
            });
        });
    }

    async loadUserData() {
        try {
            const user = this.getUserFromSession();
            document.getElementById('userName').textContent = user.firstName || 'User';

            const response = await fetch('/api/account');
            if (response.ok) {
                const data = await response.json();
                document.getElementById('balanceAmount').textContent = '$' + parseFloat(data.balance || 0).toFixed(2);
                document.getElementById('monthSpent').textContent = '$' + parseFloat(data.monthSpent || 0).toFixed(2);
                document.getElementById('monthReceived').textContent = '$' + parseFloat(data.monthReceived || 0).toFixed(2);
                if (data.twoFaEnabled) {
                    document.getElementById('twoFaStatus').textContent = 'Enabled ✓';
                }
                this.userData = { ...user, ...data };
            } else {
                document.getElementById('balanceAmount').textContent = '$0.00';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadTransactions() {
        try {
            const transactionsList = document.getElementById('transactionsList');
            transactionsList.innerHTML = '';

            // Try to fetch from API
            const response = await fetch('/api/transactions');
            let transactions = [];

            if (response.ok) {
                const data = await response.json();
                transactions = data.transactions || [];
            }

            // Use sample data if no transactions
            if (transactions.length === 0) {
                transactionsList.innerHTML = '<p style="padding: 2rem; text-align: center; color: #b0b0c0;">No transactions yet</p>';
                return;
            }

            transactions.forEach(txn => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                
                const icon = txn.type === 'debit' || txn.type === 'payment' ? '📤' : '📥';
                const amountClass = txn.type === 'debit' || txn.type === 'payment' ? 'debit' : 'credit';
                const amountSign = txn.type === 'debit' || txn.type === 'payment' ? '-' : '+';
                
                item.innerHTML = `
                    <div class="transaction-left">
                        <div class="transaction-icon">${icon}</div>
                        <div class="transaction-details">
                            <h4>${txn.description || txn.type}</h4>
                            <p>${new Date(txn.date || txn.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount ${amountClass}">
                            ${amountSign}$${Math.abs(txn.amount).toFixed(2)}
                        </div>
                        <div class="transaction-date">
                            ${txn.status || 'Completed'}
                        </div>
                    </div>
                `;
                transactionsList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading transactions:', error);
            document.getElementById('transactionsList').innerHTML = 
                '<p style="padding: 2rem; text-align: center; color: #ef4444;">Error loading transactions</p>';
        }
    }

    generateSampleTransactions() {
        return [];
    }

    async downloadStatement() {
        const month = prompt('Enter statement month (YYYY-MM):', new Date().toISOString().slice(0, 7));
        if (!month) return;

        try {
            const response = await fetch(`/api/statements?month=${month}`);
            if (!response.ok) throw new Error('Failed to load statement');
            const data = await response.json();
            const s = data.statement;

            const summary = [
                `HSBC Monthly Statement — ${s.month}`,
                `Account: ${s.user?.email}`,
                `Opening Balance: $${s.openingBalance.toFixed(2)}`,
                `Total Credits: $${s.totalCredit.toFixed(2)}`,
                `Total Debits: $${s.totalDebit.toFixed(2)}`,
                `Closing Balance: $${s.closingBalance.toFixed(2)}`,
                `Transactions: ${s.transactionCount}`,
                '',
                'Download CSV for full details?'
            ].join('\n');

            if (confirm(summary)) {
                window.open(`/api/statements?month=${month}&format=csv`, '_blank');
            }
        } catch (error) {
            alert('Could not load statement: ' + error.message);
        }
    }

    update2FADisplay() {
        const method = document.querySelector('input[name="2fa-method"]:checked').value;
        const methodType = document.querySelector('#methodType');
        const methodTarget = document.querySelectorAll('#methodTarget, #methodTarget2');
        const targetLabel = document.getElementById('targetLabel');
        const verifyTarget = document.getElementById('verifyTarget');

        if (method === 'email') {
            methodType.textContent = 'Email';
            methodTarget.forEach(el => el.textContent = 'email address');
            targetLabel.textContent = 'email';
            verifyTarget.type = 'email';
            verifyTarget.placeholder = 'example@email.com';
        } else {
            methodType.textContent = 'Phone';
            methodTarget.forEach(el => el.textContent = 'phone number');
            targetLabel.textContent = 'phone number';
            verifyTarget.type = 'tel';
            verifyTarget.placeholder = '+1 (555) 000-0000';
        }
    }

    async sendOTPCode() {
        const method = document.querySelector('input[name="2fa-method"]:checked').value;
        const target = document.getElementById('verifyTarget').value;
        const sendBtn = document.getElementById('sendCodeBtn');

        if (!target) {
            alert('Please enter your ' + method);
            return;
        }

        // Disable button during send
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        try {
            const response = await fetch('/api/user/send-2fa-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    method: method,
                    target: target
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.switchStep(3);
                if (data.testCode) {
                    alert(`Code sent to your ${method}!\n\nDev mode code: ${data.testCode}`);
                } else {
                    alert(`Code sent to your ${method}!`);
                }
            } else {
                alert('Failed to send code. Please try again.');
            }
        } catch (error) {
            console.error('Error sending code:', error);
            alert('Error: ' + error.message);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Code';
        }
    }

    async verify2FA() {
        const otpCode = document.getElementById('otpCode').value;
        const verifyBtn = document.getElementById('verifyCodeBtn');

        if (!otpCode || otpCode.length !== 6) {
            alert('Please enter a valid 6-digit code');
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const response = await fetch('/api/user/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    otpCode: otpCode
                })
            });

            if (response.ok) {
                document.getElementById('twoFaModal').classList.remove('active');
                document.getElementById('twoFaStatus').textContent = 'Enabled ✓';
                alert('Two-Factor Authentication enabled successfully!');
                this.resetModal();
            } else {
                alert('Invalid code. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying 2FA:', error);
            alert('Error: ' + error.message);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify & Enable';
        }
    }

    switchStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('step' + stepNumber).classList.add('active');
    }

    resetModal() {
        this.switchStep(1);
        document.getElementById('verifyTarget').value = '';
        document.getElementById('otpCode').value = '';
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.auth?.clearAuth();
            
            // Redirect to login
            window.location.href = '/';
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
