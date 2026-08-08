# 💳 Card Management API - Complete Setup Guide

## ✅ What Was Fixed

**Before:** Card data was only stored in JavaScript memory  
**Now:** Card data is saved to MySQL database

### Changes Made:

1. ✅ Added `/api/cards` POST endpoint in server-mysql.js
2. ✅ Added `/api/cards` GET endpoint to fetch saved cards
3. ✅ Added `/api/cards/:id` PUT endpoint to update card details
4. ✅ Added `/api/cards/:id` DELETE endpoint to remove cards
5. ✅ Updated cards.js to send data to the database
6. ✅ All card data now persists in MySQL

---

## 🧪 Testing the Card API

### Step 1: Verify Database Is Ready

**In MySQL Workbench, run:**

```sql
USE hsbc_bank;
DESCRIBE cards;
```

**Expected Output:** 
```
Table structure with 14 columns:
- id, userId, cardNumber, cardholderName, cardType, 
- expiryMonth, expiryYear, issuer, status, dailyLimit,
- monthlyLimit, isPrimary, createdAt, updatedAt
```

---

### Step 2: Test Adding a Card Via UI

1. **Open:** http://localhost:3000/dashboard
2. **Login** with your credentials
3. **Click:** "Cards" in the navbar
4. **Click:** "+ Add Card" button
5. **Fill in:**
   - Cardholder Name: `John Doe`
   - Card Type: `Debit`
   - Card Provider: `Visa`
   - Spending Limit: `50000`
   - Daily Limit: `5000`
6. **Click:** "Add Card"
7. **Expected:** ✅ "Card added successfully and saved to database!"

---

### Step 3: Verify Card Was Saved to MySQL

**In MySQL Workbench, run:**

```sql
USE hsbc_bank;
SELECT * FROM cards;
```

**Expected Output:**
```
Your newly added card should appear with:
- id: Auto-generated
- userId: Your user ID (1, 2, 3, or 4)
- cardNumber: Generated randomly
- cardholderName: John Doe
- cardType: debit
- issuer: Visa
- status: active
- createdAt: Current timestamp
```

---

### Step 4: Test API Endpoint Directly

**Test the GET endpoint (fetch cards):**

In PowerShell:
```powershell
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/cards?userId=1' -Method GET | ConvertTo-Json"
```

**Expected Output:**
```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "userId": 1,
      "cardNumber": "8475639295849485",
      "cardholderName": "John Doe",
      "cardType": "debit",
      "issuer": "Visa",
      "status": "active",
      "createdAt": "2026-02-21 10:30:45"
    }
  ]
}
```

---

### Step 5: Test Card Persistence

1. **Add a card** (as in Step 2)
2. **Refresh the page** (F5 or Ctrl+R)
3. **Expected:** Card should still be visible (loaded from database)

---

## 🔗 Complete Card API Reference

### GET /api/cards
Fetch all cards for a user

**Request:**
```
GET /api/cards?userId=1
```

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "userId": 1,
      "cardNumber": "1234567890123456",
      "cardholderName": "John Doe",
      "cardType": "debit",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "issuer": "Visa",
      "status": "active",
      "dailyLimit": 5000,
      "monthlyLimit": 50000,
      "isPrimary": false,
      "createdAt": "2026-02-21 10:30:45"
    }
  ]
}
```

---

### POST /api/cards
Add a new card

**Request:**
```json
POST /api/cards
{
  "userId": 1,
  "cardNumber": "1234567890123456",
  "cardholderName": "John Doe",
  "cardType": "debit",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "provider": "Visa",
  "dailyLimit": 5000,
  "monthlyLimit": 50000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card added successfully",
  "cardId": 1,
  "card": {
    "id": 1,
    "userId": 1,
    "cardNumber": "1234567890123456",
    "cardholderName": "John Doe",
    "cardType": "debit",
    "status": "active"
  }
}
```

---

### PUT /api/cards/:id
Update card details

**Request:**
```json
PUT /api/cards/1
{
  "dailyLimit": 8000,
  "monthlyLimit": 80000,
  "status": "blocked"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card updated successfully"
}
```

---

### DELETE /api/cards/:id
Delete a card

**Request:**
```
DELETE /api/cards/1
```

**Response:**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

---

## 📊 Verify Complete Card Data in MySQL

**Run this query in MySQL Workbench:**

```sql
USE hsbc_bank;

-- Show all cards with user information
SELECT 
    c.id as 'Card ID',
    u.firstName as 'User',
    c.cardType as 'Type',
    c.cardNumber as 'Card Number',
    c.issuer as 'Provider',
    c.status as 'Status',
    c.dailyLimit as 'Daily Limit',
    c.monthlyLimit as 'Monthly Limit',
    c.createdAt as 'Added Date'
FROM cards c
JOIN users u ON c.userId = u.id
ORDER BY c.createdAt DESC;
```

**Expected Output:**
```
Card ID | User      | Type   | Card Number     | Provider | Status | Daily Limit | Monthly Limit | Added Date
1       | John      | debit  | 8475639295849485| Visa     | active | 5000        | 50000         | 2026-02-21 10:30:45
```

---

## ✅ Complete Flow Verification

### Test Scenario:

1. **Login** as user ID 1
2. **Go to Cards page**
3. **Add Card #1:**
   - Name: John Debit
   - Type: Debit
   - Provider: Visa
4. **Verify in MySQL:**
   ```sql
   SELECT COUNT(*) FROM cards WHERE userId = 1;
   -- Should show: 1
   ```
5. **Add Card #2:**
   - Name: John Credit
   - Type: Credit
   - Provider: Mastercard
6. **Verify in MySQL:**
   ```sql
   SELECT COUNT(*) FROM cards WHERE userId = 1;
   -- Should show: 2
   ```
7. **Refresh** the Cards page
8. **Verify:** Both cards still appear (loaded from database)
9. **Check MySQL:**
   ```sql
   SELECT cardholderName, cardType FROM cards WHERE userId = 1;
   -- Should show both cards
   ```

---

## 🐛 Troubleshooting

### Card not appearing in database?

1. **Check server logs** for errors
2. **Verify database migration completed:**
   ```sql
   SHOW TABLES;
   -- Should include: cards
   ```
3. **Verify cards table has correct structure:**
   ```sql
   DESCRIBE cards;
   -- Should have 14 columns
   ```
4. **Test API endpoint directly:**
   ```bash
   # PowerShell
   powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/cards?userId=1' | ConvertTo-Json"
   ```

### Server error "table doesn't exist"?

1. **Run the migration script** in MySQL Workbench
2. **Restart the server:**
   ```bash
   Get-Process node | Stop-Process -Force
   cd "d:\projects\bank card\hsbc-bank"
   node server-mysql.js
   ```

### Card disappears after refresh?

This means it's **NOT** being saved to the database. Check:
1. ✅ Database migration completed
2. ✅ Server has new API endpoints (check server logs)
3. ✅ No console errors (press F12 → Console tab)

---

## 📝 Server Logs to Check

When adding a card, you should see in the server console:

```
✅ Card added successfully for user 1: 8485
```

If you don't see this, the card didn't reach the database.

---

## 🎯 Success Indicators

You've successfully fixed the issue when:

✅ Card added from UI appears in MySQL database  
✅ Card persists after page refresh  
✅ MySQL query shows correct card data  
✅ API endpoints respond with card data  
✅ No "table doesn't exist" errors  

---

## 📍 Files Modified

1. **server-mysql.js** - Added 4 new API endpoints:
   - GET /api/cards
   - POST /api/cards
   - PUT /api/cards/:id
   - DELETE /api/cards/:id

2. **public/js/cards.js** - Updated submitAddCard() function to:
   - Send data to server API
   - Wait for response before adding to UI
   - Show confirmation message with database confirmation

---

## 🚀 Next Steps

1. **Test adding cards** through the UI
2. **Verify in MySQL** that cards appear in the database
3. **Test card persistence** by refreshing the page
4. **You're ready for Phase 4A** (Email/SMS notifications for card alerts)

---

**Status:** Card data now saves to MySQL ✅  
**Database:** 14 tables ready ✅  
**Server:** API endpoints active ✅  

Ready to test!
