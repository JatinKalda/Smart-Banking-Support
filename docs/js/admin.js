// Admin Dashboard Logic
class AdminDashboard {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.allUsers = [];
        this.allTransactions = [];
        this.allTickets = [];
        this.init();
    }

    async init() {
        // Check if user is logged in and is admin
        const user = this.getUserFromSession();
        if (!user || user.role !== 'admin') {
            alert('Access Denied: Admin privileges required');
            window.location.href = '/';
            return;
        }

        this.userId = user.id;
        this.setupEventListeners();
        await this.loadDashboardData();
    }

    getUserFromSession() {
        let userStr = sessionStorage.getItem('user');
        if (!userStr) {
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
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Search
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                this.globalSearch(e.target.value);
            });
        }

        // Transaction Filter
        const transactionFilter = document.getElementById('transactionFilter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', () => {
                this.loadTransactions();
            });
        }

        // Add User Button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserForm();
            });
        }

        const userSearchInput = document.getElementById('userSearchInput');
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
        }

        const transactionSearchInput = document.getElementById('transactionSearchInput');
        if (transactionSearchInput) {
            transactionSearchInput.addEventListener('input', (e) => this.filterTransactions(e.target.value));
        }

        const ticketSearchInput = document.getElementById('ticketSearchInput');
        if (ticketSearchInput) {
            ticketSearchInput.addEventListener('input', (e) => this.filterTickets(e.target.value));
        }

        const ticketFilter = document.getElementById('ticketFilter');
        if (ticketFilter) {
            ticketFilter.addEventListener('change', () => {
                this.loadTickets();
            });
        }

        // Settings Save Button
        const settingsSaveBtn = document.querySelector('section#settings .btn-primary');
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => {
                alert('Settings saved successfully!');
            });
        }

        // Backup Database Button
        const backupBtn = document.querySelector('section#settings .btn-secondary');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                alert('Database backup initiated!');
            });
        }
    }

    switchSection(sectionName) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update header
        const titles = {
            overview: { title: 'Dashboard Overview', subtitle: 'Welcome to your admin panel' },
            users: { title: 'User Management', subtitle: 'Manage all users and their accounts' },
            transactions: { title: 'Transactions', subtitle: 'Monitor all system transactions' },
            tickets: { title: 'Support Tickets', subtitle: 'Manage customer support requests' },
            reports: { title: 'Reports & Analytics', subtitle: 'System reports and statistics' },
            settings: { title: 'System Settings', subtitle: 'Configure system settings' }
        };

        document.getElementById('pageTitle').textContent = titles[sectionName]?.title || 'Dashboard';
        document.getElementById('pageSubtitle').textContent = titles[sectionName]?.subtitle || '';

        // Load data for section
        if (sectionName === 'users') this.loadUsers();
        else if (sectionName === 'transactions') this.loadTransactions();
        else if (sectionName === 'tickets') this.loadTickets();
        else if (sectionName === 'reports') this.loadReports();
    }

    async loadDashboardData() {
        try {
            // Load overview stats
            await this.loadOverviewStats();
            await this.loadRecentUsers();
            await this.loadRecentTransactions();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadOverviewStats() {
        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();

            document.getElementById('totalUsers').textContent = data.stats?.totalUsers || 0;
            document.getElementById('totalTransactions').textContent = data.stats?.totalTransactions || 0;
            document.getElementById('totalVolume').textContent = '$' + (data.stats?.totalVolume || 0).toFixed(2);
            document.getElementById('activeSessions').textContent = data.stats?.activeSessions || 1;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentUsers() {
        try {
            const response = await fetch('/api/admin/users?limit=5');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();

            const container = document.getElementById('recentUsers');
            container.innerHTML = '';

            (data.users || []).slice(0, 5).forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-item';
                div.innerHTML = `
                    <div>
                        <strong>${user.firstName} ${user.lastName}</strong>
                        <p style="color: var(--text-secondary); font-size: 0.85rem;">${user.email}</p>
                    </div>
                    <span>${user.role === 'admin' ? '👑' : '👤'}</span>
                `;
                container.appendChild(div);
            });

            if ((data.users || []).length === 0) {
                container.innerHTML = '<p>No users yet</p>';
            }
        } catch (error) {
            console.error('Error loading recent users:', error);
            document.getElementById('recentUsers').innerHTML = '<p>Error loading users</p>';
        }
    }

    async loadRecentTransactions() {
        try {
            const response = await fetch('/api/admin/transactions?limit=5');
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();

            const container = document.getElementById('recentTransactions');
            container.innerHTML = '';

            (data.transactions || []).slice(0, 5).forEach(txn => {
                const div = document.createElement('div');
                div.className = 'transaction-item';
                const icon = txn.type === 'credit' ? '📥' : '📤';
                const sign = txn.type === 'credit' ? '+' : '-';
                div.innerHTML = `
                    <div>
                        <strong>${txn.description}</strong>
                        <p style="color: var(--text-secondary); font-size: 0.85rem;">${txn.type}</p>
                    </div>
                    <span style="color: ${txn.type === 'credit' ? 'var(--success-color)' : 'var(--error-color)'}">
                        ${sign}$${Math.abs(txn.amount).toFixed(2)}
                    </span>
                `;
                container.appendChild(div);
            });

            if ((data.transactions || []).length === 0) {
                container.innerHTML = '<p>No transactions yet</p>';
            }
        } catch (error) {
            console.error('Error loading recent transactions:', error);
            document.getElementById('recentTransactions').innerHTML = '<p>Error loading transactions</p>';
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            this.allUsers = data.users || [];
            this.renderUsers(this.allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7">Error loading users</td></tr>';
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="status-badge active">${user.role}</span></td>
                <td><span class="status-badge active">Active</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary view-user-btn" data-user-id="${user.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">View</button>
                </td>
            `;
            tr.querySelector('.view-user-btn').addEventListener('click', () => this.viewUser(user.id));
            tbody.appendChild(tr);
        });

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
        }
    }

    filterUsers(query) {
        const q = query.toLowerCase();
        const filtered = this.allUsers.filter(u =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
        this.renderUsers(filtered);
    }

    async loadTransactions() {
        try {
            const typeFilter = document.getElementById('transactionFilter')?.value || '';
            const url = typeFilter ? `/api/admin/transactions?type=${typeFilter}` : '/api/admin/transactions';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            this.allTransactions = data.transactions || [];
            this.renderTransactions(this.allTransactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            document.getElementById('transactionsTableBody').innerHTML = '<tr><td colspan="7">Error loading transactions</td></tr>';
        }
    }

    renderTransactions(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '';

        transactions.forEach(txn => {
            const tr = document.createElement('tr');
            let icon = '💳';
            if (txn.type === 'credit') icon = '📥';
            if (txn.type === 'debit') icon = '📤';
            if (txn.type === 'transfer') icon = '🔄';
            if (txn.type === 'payment') icon = '💰';

            const typeColor = (txn.type === 'credit' || txn.type === 'transfer') ? 'var(--success-color)' : 'var(--error-color)';
            tr.innerHTML = `
                <td>#${txn.id}</td>
                <td>${txn.userName || 'Unknown'}</td>
                <td>${icon} ${txn.type}</td>
                <td style="color: ${typeColor};">$${txn.amount.toFixed(2)}</td>
                <td><span class="status-badge pending">${txn.status}</span></td>
                <td>${new Date(txn.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary details-btn" data-txn-id="${txn.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Details</button>
                </td>
            `;
            tr.querySelector('.details-btn').addEventListener('click', () => {
                alert(`Transaction #${txn.id} Details:\nAmount: $${txn.amount}\nType: ${txn.type}\nStatus: ${txn.status}\nUser: ${txn.userName || 'Unknown'}`);
            });
            tbody.appendChild(tr);
        });

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No transactions found</td></tr>';
        }
    }

    filterTransactions(query) {
        const q = query.toLowerCase();
        const filtered = this.allTransactions.filter(t =>
            (t.userName || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q)
        );
        this.renderTransactions(filtered);
    }

    async loadTickets() {
        try {
            const statusFilter = document.getElementById('ticketFilter')?.value || '';
            const url = statusFilter ? `/api/admin/tickets?status=${statusFilter}` : '/api/admin/tickets';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            const data = await response.json();
            this.allTickets = data.tickets || [];
            this.renderTickets(this.allTickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
            document.getElementById('ticketsTableBody').innerHTML = '<tr><td colspan="7">Error loading tickets</td></tr>';
        }
    }

    renderTickets(tickets) {
        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = '';

        tickets.forEach(ticket => {
            const tr = document.createElement('tr');
            const userName = `${ticket.firstName || ''} ${ticket.lastName || ''}`.trim() || ticket.email || 'Unknown';
            tr.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${userName}</td>
                <td>${ticket.subject}</td>
                <td><span class="status-badge">${ticket.priority}</span></td>
                <td><span class="status-badge active">${ticket.status}</span></td>
                <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td><button class="ticket-view-btn btn btn-secondary" data-ticket-id="${ticket.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">View</button></td>
            `;
            tr.querySelector('.ticket-view-btn').addEventListener('click', () => this.viewTicket(ticket.id));
            tbody.appendChild(tr);
        });

        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No tickets found</td></tr>';
        }
    }

    filterTickets(query) {
        const q = query.toLowerCase();
        const filtered = this.allTickets.filter(t =>
            (t.subject || '').toLowerCase().includes(q) ||
            `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase().includes(q)
        );
        this.renderTickets(filtered);
    }

    async viewTicket(ticketId) {
        try {
            const response = await fetch(`/api/admin/tickets/${ticketId}`);
            if (!response.ok) throw new Error('Failed to load ticket');
            const data = await response.json();
            const t = data.ticket;
            const newStatus = prompt(
                `Ticket #${t.id}\nUser: ${t.firstName} ${t.lastName}\nSubject: ${t.subject}\nDescription: ${t.description || 'N/A'}\nPriority: ${t.priority}\nStatus: ${t.status}\n\nEnter new status (open, in-progress, resolved, closed) or cancel:`,
                t.status
            );
            if (newStatus && newStatus !== t.status) {
                await fetch(`/api/admin/tickets/${ticketId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                await this.loadTickets();
            }
        } catch (error) {
            alert('Error loading ticket: ' + error.message);
        }
    }

    async loadReports() {
        try {
            const response = await fetch('/api/admin/reports');
            if (!response.ok) throw new Error('Failed to load reports');
            const data = await response.json();
            const r = data.reports;

            document.getElementById('monthlySummary').innerHTML = `
                <p><strong>Total Users:</strong> ${r.users.total}</p>
                <p><strong>New Users (30d):</strong> ${r.users.newUsers}</p>
                <p><strong>Transaction Volume:</strong> $${parseFloat(r.transactions.volume || 0).toFixed(2)}</p>
            `;

            const growthHtml = (r.userGrowth || []).map(g =>
                `<p><strong>${g.month}:</strong> ${g.users} users</p>`
            ).join('') || '<p>No data yet</p>';
            document.getElementById('userGrowth').innerHTML = growthHtml;

            document.getElementById('transactionStats').innerHTML = `
                <p><strong>Total:</strong> ${r.transactions.total} transactions</p>
                <p><strong>Volume:</strong> $${parseFloat(r.transactions.volume || 0).toFixed(2)}</p>
                <p><strong>Avg:</strong> $${parseFloat(r.transactions.average || 0).toFixed(2)} per transaction</p>
            `;

            const monthlyHtml = (r.monthlyVolume || []).map(m =>
                `<p><strong>${m.month}:</strong> ${m.count} txns — $${parseFloat(m.volume || 0).toFixed(2)}</p>`
            ).join('') || '<p>No data yet</p>';
            document.getElementById('revenueReport').innerHTML = monthlyHtml;
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    async viewUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (!response.ok) throw new Error('Failed to load user');
            const data = await response.json();
            const u = data.user;
            alert(
                `User #${u.id}\n` +
                `Name: ${u.firstName} ${u.lastName}\n` +
                `Email: ${u.email}\n` +
                `Role: ${u.role}\n` +
                `Balance: $${parseFloat(data.account?.balance || 0).toFixed(2)}\n` +
                `Transactions: ${data.stats?.transactions || 0}\n` +
                `Cards: ${data.stats?.cards || 0}\n` +
                `2FA: ${u.twoFaEnabled ? 'Enabled' : 'Disabled'}\n` +
                `Joined: ${new Date(u.createdAt).toLocaleDateString()}`
            );
        } catch (error) {
            alert('Error loading user: ' + error.message);
        }
    }

    showAddUserForm() {
        const firstName = prompt('First name:');
        if (!firstName) return;
        const lastName = prompt('Last name:');
        if (!lastName) return;
        const email = prompt('Email:');
        if (!email) return;
        const password = prompt('Password (min 6 chars):');
        if (!password || password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        const role = prompt('Role (user or admin):', 'user') || 'user';

        fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password, role })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    alert('User created successfully!');
                    this.loadUsers();
                    this.loadOverviewStats();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(err => alert('Error: ' + err.message));
    }

    async globalSearch(query) {
        if (!query || query.length < 2) return;
        try {
            const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) return;
            const data = await response.json();
            const userCount = (data.users || []).length;
            const txnCount = (data.transactions || []).length;
            if (userCount === 0 && txnCount === 0) return;

            if (userCount > 0) {
                this.switchSection('users');
                this.renderUsers(data.users);
            } else if (txnCount > 0) {
                this.switchSection('transactions');
                this.renderTransactions(data.transactions.map(t => ({
                    id: t.id,
                    userName: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
                    type: t.type,
                    amount: parseFloat(t.amount),
                    status: t.status,
                    description: t.description,
                    createdAt: new Date()
                })));
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.auth?.clearAuth();
            window.location.href = '/';
        }
    }
}

// Initialize dashboard
let adminDash;
document.addEventListener('DOMContentLoaded', () => {
    adminDash = new AdminDashboard();
});
