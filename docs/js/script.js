// Store selected role
let selectedRole = null;

// Role Selection Handlers
document.getElementById('selectAdmin')?.addEventListener('click', function() {
    selectedRole = 'admin';
    sessionStorage.setItem('selectedRole', 'admin');
    showLoginForm();
});

document.getElementById('selectUser')?.addEventListener('click', function() {
    selectedRole = 'user';
    sessionStorage.setItem('selectedRole', 'user');
    showLoginForm();
});

// Back Button Handler
document.getElementById('backBtn')?.addEventListener('click', function() {
    selectedRole = null;
    sessionStorage.removeItem('selectedRole');
    showRoleSelector();
});

function showRoleSelector() {
    document.getElementById('roleSelector').classList.add('active');
    document.querySelector('.card-wrapper').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('roleSelector').classList.remove('active');
    document.querySelector('.card-wrapper').classList.remove('hidden');
    document.getElementById('loginBtn').click();
}

// Toggle between Login and Signup forms
document.getElementById('loginBtn').addEventListener('click', function() {
    showForm('login');
});

document.getElementById('signupBtn').addEventListener('click', function() {
    showForm('signup');
});

function showForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (formType === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }

    // Clear error messages
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
    document.getElementById('loginSuccess').textContent = '';
    document.getElementById('signupSuccess').textContent = '';
}

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, selectedRole: selectedRole })
        });

        const data = await response.json();

        if (data.success) {
            // Verify role matches selected role
            if (selectedRole === 'admin' && data.user.role !== 'admin') {
                document.getElementById('loginError').textContent = '❌ This account is not an admin account. Please select "User Login".';
                return;
            }
            if (selectedRole === 'user' && data.user.role === 'admin') {
                document.getElementById('loginError').textContent = '❌ This is an admin account. Please select "Admin Login".';
                return;
            }

            // Store user info with role
            window.auth?.setToken(data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('loginSuccess').textContent = 'Login successful!';
            showLoadingAnimation();
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        } else {
            document.getElementById('loginError').textContent = data.message;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
});

// Handle Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Only allow signup for User accounts
    if (selectedRole === 'admin') {
        document.getElementById('signupError').textContent = '❌ Admin accounts cannot be created. Please contact your system administrator.';
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, password, confirmPassword })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info with role (auto-assigned to 'user' for new signups)
            window.auth?.setToken(data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user || {
                id: null,
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: 'user'
            }));
            document.getElementById('signupSuccess').textContent = 'Account created successfully!';
            showLoadingAnimation();
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        } else {
            document.getElementById('signupError').textContent = data.message;
        }
    } catch (error) {
        document.getElementById('signupError').textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
});

// Show Loading Animation
function showLoadingAnimation() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
}
