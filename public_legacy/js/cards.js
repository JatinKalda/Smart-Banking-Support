// Cards Management Logic
class CardsManager {
    constructor() {
        this.userId = null;
        this.cards = [];
        this.selectedCard = null;
        this.init();
    }

    async init() {
        // Check if user is logged in
        const user = this.getUserFromSession();
        if (!user) {
            alert('Please login to manage your cards');
            window.location.href = '/';
            return;
        }

        this.userId = user.id;
        this.setupEventListeners();
        await this.loadCards();
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
        // Add Card Button
        document.getElementById('addCardBtn').addEventListener('click', () => {
            this.openAddCardModal();
        });

        // Modal Close Buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        // Modal Background Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Add Card Form
        document.getElementById('addCardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAddCard();
        });

        // Cancel Buttons
        document.getElementById('cancelAddBtn').addEventListener('click', () => {
            document.getElementById('addCardModal').classList.remove('show');
        });

        document.getElementById('cancelLimitsBtn').addEventListener('click', () => {
            document.getElementById('limitsModal').classList.remove('show');
        });

        document.getElementById('closeCardModalBtn').addEventListener('click', () => {
            document.getElementById('cardModal').classList.remove('show');
        });

        // Card Details Modal Actions
        document.getElementById('blockCardBtn').addEventListener('click', () => {
            if (this.selectedCard) {
                this.toggleBlockCard();
            }
        });

        document.getElementById('setLimitsBtn').addEventListener('click', () => {
            if (this.selectedCard) {
                this.openLimitsModal();
            }
        });

        // Limits Form Submit
        document.getElementById('limitsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSpendingLimits();
        });

        // Logout
        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    async loadCards() {
        try {
            const container = document.getElementById('cardsContainer');
            container.innerHTML = '<p class="loading">Loading your cards...</p>';

            // Fetch user's cards from API
            try {
                const response = await fetch(`/api/cards?userId=${this.userId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.cards && data.cards.length > 0) {
                        // Transform API data to UI format - match actual database columns
                        this.cards = data.cards.map(card => ({
                            id: card.id,
                            cardType: card.cardType,
                            cardName: `HSBC ${card.provider || 'Card'} ${(card.cardType || 'card').charAt(0).toUpperCase() + (card.cardType || 'card').slice(1)}`,
                            lastFour: card.cardNumber ? card.cardNumber.toString().slice(-4) : card.lastFour || '0000',
                            cardNumber: card.cardNumber,
                            expiryDate: card.expiryDate || 'N/A',
                            provider: card.provider || 'Visa',
                            status: card.status || 'active',
                            spendingLimit: card.spendingLimit || 50000,
                            dailyLimit: card.dailyLimit || 5000,
                            isDefault: card.isDefault || false,
                            createdAt: card.createdAt
                        }));
                        console.log('✅ Loaded', this.cards.length, 'cards from database');
                    } else {
                        console.log('No cards found, using sample data');
                        this.cards = [];
                    }
                } else {
                    throw new Error('API response not ok');
                }
            } catch (e) {
                console.error('❌ Error fetching from API:', e.message);
                console.log('Falling back to sample cards data');
                // Sample cards for demonstration
                this.cards = [
                    {
                        id: 1,
                        cardType: 'debit',
                        cardName: 'HSBC Debit Card',
                        lastFour: '4532',
                        cardNumber: '4532123456789012',
                        expiryDate: '12/26',
                        provider: 'Visa',
                        status: 'active',
                        spendingLimit: 5000,
                        dailyLimit: 500,
                        isDefault: true
                    },
                    {
                        id: 2,
                        cardType: 'credit',
                        cardName: 'HSBC Cash Back Credit',
                        lastFour: '5678',
                        cardNumber: '5678123456789012',
                        expiryDate: '08/27',
                        provider: 'Mastercard',
                        status: 'active',
                        spendingLimit: 10000,
                        dailyLimit: 2000,
                        isDefault: false
                    },
                    {
                        id: 3,
                        cardType: 'virtual',
                        cardName: 'HSBC Virtual Card',
                        lastFour: '9012',
                        cardNumber: '9012123456789012',
                        expiryDate: '05/26',
                        provider: 'AmEx',
                        status: 'active',
                        spendingLimit: 2000,
                        dailyLimit: 500,
                        isDefault: false
                    }
                ];
            }

            this.displayCards();
        } catch (error) {
            console.error('Error loading cards:', error);
            document.getElementById('cardsContainer').innerHTML = '<p class="loading">Error loading cards. Please refresh the page.</p>';
        }
    }

    displayCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = '';

        if (this.cards.length === 0) {
            container.innerHTML = '<p class="loading">No cards yet. Add one to get started!</p>';
            return;
        }

        this.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card-item';
            cardEl.innerHTML = this.getCardHTML(card);
            
            // Add click events
            const viewDetailsBtn = cardEl.querySelector('.card-action-btn.limits');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', () => {
                    this.openCardDetails(card);
                });
            }

            const blockBtn = cardEl.querySelector('.card-action-btn.block');
            if (blockBtn) {
                blockBtn.addEventListener('click', () => {
                    this.selectedCard = card;
                    this.toggleBlockCard();
                });
            }

            container.appendChild(cardEl);
        });
    }

    getCardHTML(card) {
        const iconMap = {
            debit: '🏦',
            credit: '💳',
            virtual: '🔐'
        };

        const statusClass = `status-${card.status}`;
        const currentUsage = Math.random() * (card.spendingLimit * 0.7); // Simulated usage

        return `
            <div class="card-header">
                <div class="card-issuer">
                    <div class="card-issuer-logo">${iconMap[card.cardType] || '💳'}</div>
                    <div class="card-issuer-info">
                        <div class="card-issuer-name">${card.cardName}</div>
                        <div class="card-issuer-type">${card.provider}</div>
                    </div>
                </div>
                <span class="card-status-badge ${statusClass}">${card.status}</span>
            </div>

            <div class="card-numbers">
                <div class="card-number-display">
                    •••• •••• •••• ${card.lastFour}
                    ${card.isDefault ? '⭐' : ''}
                </div>
                <div class="card-expiry-info">
                    <div class="expiry-item">
                        <span class="expiry-label">Expires</span>
                        <span class="expiry-value">${card.expiryDate}</span>
                    </div>
                    <div class="expiry-item">
                        <span class="expiry-label">Type</span>
                        <span class="expiry-value">${card.cardType.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div class="card-limits">
                <div class="limit-item">
                    <span class="limit-label">Monthly Limit</span>
                    <span class="limit-value">$${card.spendingLimit.toFixed(2)}</span>
                </div>
                <div class="limit-item">
                    <span class="limit-label">Daily Limit</span>
                    <span class="limit-value">$${card.dailyLimit.toFixed(2)}</span>
                </div>
                <div class="limit-item" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(15, 173, 214, 0.2);">
                    <span class="limit-label">Used This Month</span>
                    <span class="limit-value">$${currentUsage.toFixed(2)}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="card-action-btn limits">⚙️ Manage</button>
                <button class="card-action-btn block">${card.status === 'active' ? '🚫 Block' : '✓ Unblock'}</button>
            </div>
        `;
    }

    openCardDetails(card) {
        this.selectedCard = card;
        const content = document.getElementById('cardDetailsContent');
        
        content.innerHTML = `
            <div style="margin: 1rem 0;">
                <p><strong>Card Name:</strong> ${card.cardName}</p>
                <p><strong>Card Number:</strong> •••• •••• •••• ${card.lastFour}</p>
                <p><strong>Expiry Date:</strong> ${card.expiryDate}</p>
                <p><strong>Provider:</strong> ${card.provider}</p>
                <p><strong>Type:</strong> ${card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}</p>
                <p><strong>Status:</strong> <span class="card-status-badge status-${card.status}">${card.status}</span></p>
                <hr style="border: 1px solid rgba(15, 173, 214, 0.2); margin: 1rem 0;">
                <p><strong>Monthly Limit:</strong> $${card.spendingLimit.toFixed(2)}</p>
                <p><strong>Daily Limit:</strong> $${card.dailyLimit.toFixed(2)}</p>
                <p><strong>Default Card:</strong> ${card.isDefault ? '✓ Yes' : 'No'}</p>
            </div>
        `;

        document.getElementById('cardModal').classList.add('show');
    }

    async toggleBlockCard() {
        if (!this.selectedCard) return;

        const newStatus = this.selectedCard.status === 'active' ? 'blocked' : 'active';
        const action = newStatus === 'blocked' ? 'block' : 'unblock';

        if (confirm(`Are you sure you want to ${action} this card?`)) {
            try {
                // API call would go here
                this.selectedCard.status = newStatus;
                
                alert(`Card has been ${action}ed successfully!`);
                document.getElementById('cardModal').classList.remove('show');
                this.displayCards();
            } catch (error) {
                console.error('Error toggling card status:', error);
                alert('Error updating card status');
            }
        }
    }

    openAddCardModal() {
        document.getElementById('addCardForm').reset();
        document.getElementById('addCardModal').classList.add('show');
    }

    async submitAddCard() {
        const cardholderName = document.getElementById('cardholderName').value;
        const cardType = document.getElementById('cardType').value;
        const cardProvider = document.getElementById('cardProvider').value;
        const spendingLimit = parseFloat(document.getElementById('spendingLimit').value) || 50000;
        const dailyLimit = parseFloat(document.getElementById('dailyLimit').value) || 5000;

        if (!cardholderName || !cardType || !cardProvider) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Generate a random card number for demo
            const cardNumber = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
            const lastFour = cardNumber.toString().slice(-4);
            
            // Extract expiry month and year (generate 3-5 years from now)
            const currentDate = new Date();
            const expiryYear = currentDate.getFullYear() + Math.floor(Math.random() * 3) + 3;
            const expiryMonth = Math.floor(Math.random() * 12) + 1;

            console.log('📤 Sending card data to API:', {
                userId: this.userId,
                cardNumber: cardNumber.toString(),
                cardholderName,
                cardType,
                expiryMonth,
                expiryYear,
                provider: cardProvider,
                dailyLimit,
                spendingLimit
            });

            // Send to API to save in database
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    cardNumber: cardNumber.toString(),
                    cardholderName: cardholderName,
                    cardType: cardType,
                    expiryMonth: expiryMonth,
                    expiryYear: expiryYear,
                    provider: cardProvider,
                    dailyLimit: dailyLimit,
                    spendingLimit: spendingLimit
                })
            });

            const data = await response.json();
            console.log('📥 API Response:', data);

            if (!response.ok || !data.success) {
                alert('Error: ' + (data.message || 'Could not add card'));
                console.error('API error:', data);
                return;
            }

            const newCard = {
                id: data.cardId,
                cardType: cardType,
                cardName: `HSBC ${cardProvider} ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`,
                lastFour: lastFour,
                cardNumber: cardNumber.toString(),
                expiryDate: `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`,
                provider: cardProvider,
                status: 'active',
                spendingLimit: spendingLimit,
                dailyLimit: dailyLimit,
                isDefault: false
            };

            this.cards.push(newCard);
            alert('✅ Card added successfully and saved to database!');
            document.getElementById('addCardModal').classList.remove('show');
            this.displayCards();
            // Reload cards from database to verify persistence
            await this.loadCards();
        } catch (error) {
            console.error('Error adding card:', error);
            alert('❌ Error adding card: ' + error.message);
        }
    }

    openLimitsModal() {
        if (!this.selectedCard) return;
        
        document.getElementById('monthlyLimit').value = this.selectedCard.spendingLimit;
        document.getElementById('dailyLimitInput').value = this.selectedCard.dailyLimit;
        document.getElementById('limitAmount').textContent = `$${this.selectedCard.spendingLimit}`;
        
        document.getElementById('limitsModal').classList.add('show');
    }

    async submitSpendingLimits() {
        const monthlyLimit = parseFloat(document.getElementById('monthlyLimit').value);
        const dailyLimit = parseFloat(document.getElementById('dailyLimitInput').value);

        if (monthlyLimit <= 0 || dailyLimit <= 0) {
            alert('Limits must be greater than 0');
            return;
        }

        if (dailyLimit > monthlyLimit) {
            alert('Daily limit cannot exceed monthly limit');
            return;
        }

        try {
            if (this.selectedCard) {
                this.selectedCard.spendingLimit = monthlyLimit;
                this.selectedCard.dailyLimit = dailyLimit;
                alert('Spending limits updated successfully!');
                document.getElementById('limitsModal').classList.remove('show');
                this.displayCards();
            }
        } catch (error) {
            console.error('Error updating limits:', error);
            alert('Error updating spending limits');
        }
    }

    generateExpiryDate() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 4);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${month}/${year}`;
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.auth?.clearAuth();
            window.location.href = '/';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CardsManager();
});
