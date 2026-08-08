# HSBC Bank Website

Full-featured HSBC Bank demo platform with user dashboard, transfers, cards, admin panel, 2FA, and AI chatbot.

## Stack

- **Backend:** Node.js + Express + MySQL
- **Frontend:** HTML, CSS, JavaScript (dark theme)
- **Auth:** JWT bearer tokens
- **Optional:** Email (nodemailer), SMS (Twilio), OpenAI chatbot

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MySQL 8+ with database `hsbc_bank` and user `hsbc_user` / `hsbc123` (or configure `.env`)

### 2. Install & setup

```bash
cd hsbc-bank
npm install
copy .env.example .env    # Windows — edit DB credentials if needed
npm run setup             # Creates/updates all tables and seeds defaults
```

### 3. Run

```bash
npm start                 # Starts MySQL server on http://localhost:3000
```

Legacy SQLite-only server: `npm run start:sqlite`

### 4. Use the app

1. Open `http://localhost:3000`
2. Choose **User Login** or **Admin Login**
3. Sign up as a new user, or log in with an existing account
4. The first registered user is promoted to **admin** by `npm run setup` if none exists

## Features

| Area | Capabilities |
|------|-------------|
| **Auth** | Signup, login, role-based routing (user/admin), JWT sessions |
| **Dashboard** | Real account balance, monthly stats, transactions, 2FA setup, statements |
| **Transfers** | Send money by recipient email, OTP confirmation, atomic balance updates |
| **Cards** | Add, view, update limits, block/unblock, delete cards |
| **Settings** | Profile, password, notification preferences, data export, account deletion |
| **Admin** | User management, transactions, support tickets, reports, global search |
| **Chatbot** | Rule-based + optional OpenAI RAG assistant |

## Environment

Copy `.env.example` to `.env`. Minimum for local dev:

```
DB_HOST=localhost
DB_USER=hsbc_user
DB_PASSWORD=hsbc123
DB_NAME=hsbc_bank
JWT_SECRET=your-jwt-secret-key-min-32-chars!
```

Email/SMS/OpenAI are optional — without credentials, OTP codes are logged to the server console in dev mode.

## Project Structure

```
hsbc-bank/
├── server-mysql.js       # Main production server
├── setup-database.js     # One-command DB initialization
├── routes/api-extensions.js
├── services/             # Email, SMS, notifications, audit, OTP
├── middleware/auth.js    # JWT auth
├── public/               # Frontend pages and assets
└── db-mysql.js           # MySQL connection pool
```

## Troubleshooting

- **Port 3000 in use:** Change `PORT` in `.env`
- **Database connection failed:** Verify MySQL is running and credentials in `.env` match
- **401 on API calls:** Log in again — JWT may have expired
- **Transfers fail "account not found":** Run `npm run setup` to create accounts for all users

## Security Note

This is a learning/demo project. Passwords are stored in plain text. Do not use in production without bcrypt, HTTPS, and proper secrets management.
