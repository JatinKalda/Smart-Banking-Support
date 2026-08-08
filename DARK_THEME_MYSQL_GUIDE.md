# 🎨 Dark Theme & MySQL Integration - Quick Guide

## What's New?

✨ **Dark Theme**
- Professional dark mode UI
- Cyan/Blue accents (#0f9ad6)
- Better for eyes during night development

🎯 **Message Opening Animation**
- Instead of card flip, the message now opens from the card
- Smooth 3D rotation animation
- Better visual effect on redirect

💾 **MySQL Support**
- Full MySQL integration ready
- Async/await for better error handling
- Connection pooling for better performance

---

## 🚀 Quick Start

### Option 1: Using SQLite (Default - No Setup Needed)

```bash
cd "d:\projects\bank card\hsbc-bank"
npm install
npm start
```

✅ Works immediately, no database setup needed!

### Option 2: Using MySQL (Recommended for Production)

**Step 1: Install MySQL**
- Download from: https://dev.mysql.com/downloads/windows/installer/
- Follow the installer steps
- Remember your root password!

**Step 2: Install MySQL Package**

```bash
npm install mysql2
```

**Step 3: Configure Connection**

Open `db-mysql.js` and update:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_MYSQL_PASSWORD_HERE',  // ← Change this!
  database: 'hsbc_bank'
});
```

**Step 4: Start MySQL Service**

Open Command Prompt as Administrator:
```bash
net start MySQL80
```

**Step 5: Run with MySQL**

```bash
npm run start:mysql
```

---

## 🎨 Dark Theme Colors

The new color scheme uses:
- **Dark Background:** #1a1a2e, #16213e, #0d0d0d
- **Accent Color:** #0f9ad6 (Cyan)
- **Text:** Light gray/white
- **Cards:** Dark with cyan borders

To customize colors, edit:
- `public/css/style.css` - Login/Signup page
- `public/css/about.css` - About page

---

## 📝 File Structure

```
hsbc-bank/
├── server.js              ← SQLite version
├── server-mysql.js        ← MySQL version (USE THIS)
├── db.js                  ← SQLite database
├── db-mysql.js            ← MySQL database config
├── package.json
├── README.md              ← Original guide
├── MYSQL_SETUP.md         ← Complete MySQL guide
└── public/
    ├── index.html
    ├── about.html
    ├── css/
    │   ├── style.css      ← Dark theme colors here
    │   └── about.css      ← Dark theme colors here
    └── js/
        ├── script.js
        └── about.js
```

---

## 🔄 Comparison: SQLite vs MySQL

| Feature | SQLite | MySQL |
|---------|--------|-------|
| Setup | None needed | Requires installation |
| File-based | Yes (users.db) | Server-based |
| Best for | Learning/Development | Production |
| Performance | Good for small apps | Better for large apps |
| Command | `npm start` | `npm run start:mysql` |

---

## 🎬 Animation Changes

### Old Animation (Flip):
- Card flipped like a page turning
- Smooth Y-axis rotation

### New Animation (Message Opening):
- Card tilts back (like opening envelope)
- Content opens upward
- More natural movement
- Better 3D perspective

Check `public/css/style.css` for the `messageOpening` animation (lines ~92-110)

---

## 📊 Testing

### Sign Up & Login

1. Go to `http://localhost:3000`
2. Click "Sign Up" tab
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@test.com
   - Password: password123
4. Click "Create Account"
5. Watch the message opening animation! 🎬
6. You're redirected to About page

### Login Test

1. Click "Login" tab
2. Enter the email and password from signup
3. Click "Login"
4. Animation plays again
5. Redirect to About page

---

## 🛠️ Next Steps to Learn

1. **Add Password Encryption**
   ```bash
   npm install bcrypt
   ```

2. **Add Session Management**
   ```bash
   npm install express-session
   ```

3. **Add Email Validation**
   ```bash
   npm install nodemailer
   ```

4. **Deploy to Cloud**
   - Azure App Service
   - Heroku
   - AWS EC2

---

## ⚙️ Customization Tips

### Change Dark Theme Colors

Open `public/css/style.css`:

**Current Cyan Accent:**
```css
#0f9ad6  /* Change this to your color */
#0a6fa0  /* Darker shade */
```

**Dark Backgrounds:**
```css
#1a1a2e  /* Main dark */
#16213e  /* Slightly lighter */
#0d0d0d  /* Darkest section */
```

### Speed Up Animation

In `public/css/style.css`, find `messageOpening`:

Change:
```css
animation: messageOpening 2s ease-in-out forwards;
```

To:
```css
animation: messageOpening 1s ease-in-out forwards;  /* Faster */
```

### Change Animation Style

See the `messageOpening` keyframes:
```css
@keyframes messageOpening {
  0% { transform: rotateX(0deg); }
  /* ... more steps ... */
  100% { transform: rotateX(0deg) translateY(-200px); }
}
```

Edit the rotation and translate values to create different effects!

---

## 🔗 Useful Links

- [MySQL Download](https://dev.mysql.com/downloads/windows/installer/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js mysql2 Package](https://www.npmjs.com/package/mysql2)
- [Express Documentation](https://expressjs.com/)

---

## ❓ FAQ

**Q: Which should I use, SQLite or MySQL?**
A: Use SQLite for learning, MySQL for production apps.

**Q: Does the dark theme work on mobile?**
A: Yes! It's fully responsive.

**Q: Where can I find the animation code?**
A: Check `public/css/style.css` lines 90-130 and `public/css/about.css`

**Q: How do I change the colors?**
A: Edit the hex color codes (#0f9ad6, #1a1a2e, etc.) in the CSS files

**Q: Can I use both SQLite and MySQL?**
A: Yes! Use `npm start` for SQLite and `npm run start:mysql` for MySQL

---

## 🎉 Ready to Go!

Your HSBC Bank website now has:
- ✅ Beautiful dark theme
- ✅ Message opening animation
- ✅ MySQL support
- ✅ Professional look and feel

Choose your database and start building! 🚀

---

**For detailed MySQL setup instructions, see:** `MYSQL_SETUP.md`

**For original setup guide, see:** `README.md`
