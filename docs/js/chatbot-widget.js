// Floating Chatbot Widget JavaScript

class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        // Create widget HTML
        this.createWidgetHTML();
        this.attachEventListeners();
        this.showWelcomeMessage();
    }

    createWidgetHTML() {
        const widgetHTML = `
            <button class="chatbot-toggle-btn" id="chatbot-toggle" title="Chat with us!">
                💬
            </button>

            <div class="chatbot-widget" id="chatbot-widget">
                <div class="chatbot-header">
                    <div>
                        <h3>HSBC ChatBot 🤖</h3>
                        <div class="chatbot-header-status">Always here to help • Available 24/7</div>
                    </div>
                    <button class="close-chat-btn" id="close-chat">×</button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chat-message bot">
                        <div>
                            <div class="message-bubble">
                                Hello! 👋 Welcome to HSBC Bank. I'm your assistant. How can I help you today?
                            </div>
                            <div class="message-time">Just now</div>
                        </div>
                    </div>

                    <div class="chatbot-suggestions" id="chatbot-suggestions">
                        <button class="suggestion-btn" data-cmd="balance">Check Balance</button>
                        <button class="suggestion-btn" data-cmd="transfer">Transfer Money</button>
                        <button class="suggestion-btn" data-cmd="cards">Cards</button>
                        <button class="suggestion-btn" data-cmd="loans">Loans</button>
                    </div>
                </div>

                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        class="chatbot-input" 
                        placeholder="Type your message..."
                        autocomplete="off"
                    >
                    <button class="chatbot-send-btn" id="chatbot-send">Send</button>
                </div>
            </div>
        `;

        // Insert into page
        const container = document.querySelector('.chatbot-widget-container') || document.createElement('div');
        if (!container.classList.contains('chatbot-widget-container')) {
            container.className = 'chatbot-widget-container';
            container.innerHTML = widgetHTML;
            document.body.appendChild(container);
        }

        this.messagesContainer = document.getElementById('chatbot-messages');
        this.inputField = document.getElementById('chatbot-input');
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.chatWidget = document.getElementById('chatbot-widget');
        this.closeBtn = document.getElementById('close-chat');
        this.sendBtn = document.getElementById('chatbot-send');
    }

    attachEventListeners() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Suggestion buttons (delegation)
        const suggestions = document.getElementById('chatbot-suggestions');
        if (suggestions) {
            suggestions.addEventListener('click', (e) => {
                const btn = e.target.closest('.suggestion-btn');
                if (!btn) return;
                const cmd = btn.dataset.cmd || btn.textContent.trim();
                this.sendMessage(cmd);
            });
        }

        // Focus input when chat opens
        this.inputField.addEventListener('focus', () => {
            this.inputField.scrollIntoView({ behavior: 'smooth' });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.chatWidget.classList.add('active');
            this.toggleBtn.classList.add('hidden');
            this.inputField.focus();
        } else {
            this.chatWidget.classList.remove('active');
            this.toggleBtn.classList.remove('hidden');
        }
    }

    showWelcomeMessage() {
        const suggestions = [
            { text: 'Check Balance', cmd: 'balance' },
            { text: 'Transfer Money', cmd: 'transfer' },
            { text: 'Cards', cmd: 'cards' },
            { text: 'Loans', cmd: 'loans' }
        ];
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'chat-message bot';
        welcomeDiv.innerHTML = `
            <div>
                <div class="welcome-message">👋 Welcome to HSBC Support!<br>How can we help you today?</div>
            </div>
        `;

        // Insert welcome above suggestions if suggestions exist
        const suggestionsEl = document.getElementById('chatbot-suggestions');
        if (suggestionsEl && suggestionsEl.parentNode) {
            suggestionsEl.parentNode.insertBefore(welcomeDiv, suggestionsEl);
        } else {
            this.messagesContainer.appendChild(welcomeDiv);
        }
        this.messages = [];
    }

    async sendMessage(messageArg) {
        const message = (typeof messageArg === 'string' && messageArg.trim().length > 0) ? messageArg.trim() : this.inputField.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.inputField.value = '';
        this.inputField.focus();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to backend
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();

            // Add bot response
            if (data.botResponse) {
                this.addMessage(data.botResponse, 'bot');
            } else {
                this.addMessage('Sorry, I couldn\'t understand that. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, there was an error. Please try again later.', 'bot');
        }

        // Auto scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        this.messagesContainer.appendChild(messageDiv);

        // Auto scroll
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot';
        typingDiv.id = 'typing-indicator';
        
        const typingHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        typingDiv.innerHTML = typingHTML;
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatbotWidget();
    });
} else {
    new ChatbotWidget();
}
