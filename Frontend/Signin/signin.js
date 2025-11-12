// Authentication configuration
const AUTH_CONFIG = {
    apiBase: 'http://localhost:3000/api',
    tokenKey: 'spendsavvy_token', 
    userKey: 'spendsavvy_user'
};

// Authentication functions
const auth = {
    // Store login data
    storeAuthData(token, user) {
        localStorage.setItem(AUTH_CONFIG.tokenKey, token);
        localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    },
    
    // Check if user is logged in
    isAuthenticated() {
        return localStorage.getItem(AUTH_CONFIG.tokenKey) !== null;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (auth.isAuthenticated()) {
        window.location.href = '../Main/dashboard.html';
        return;
    }

    // Your existing tab switching code (keep this exactly as you have it)
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabName}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Your existing form switching links (keep this)
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab[data-tab="signup"]').click();
    });

    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab[data-tab="login"]').click();
    });

    // REPLACE the login form handler
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${AUTH_CONFIG.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                auth.storeAuthData(data.token, data.user);
                alert('Login successful! Redirecting to dashboard...');
                window.location.href = '../Main/dashboard.html';
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            alert('Network error. Please check if server is running.');
        }
    });

    // REPLACE the signup form handler  
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

        // Your existing password match check
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`${AUTH_CONFIG.apiBase}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                auth.storeAuthData(data.token, data.user);
                alert('Account created successfully! Redirecting to dashboard...');
                window.location.href = '/Main/dashboard.html';

            } else {
                alert('Signup failed: ' + data.message);
            }
        } catch (error) {
            alert('Network error. Please check if server is running.');
        }
    });

    // Keep your existing social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('google') ? 'Google' : 'Facebook';
            alert(`Redirecting to ${platform} authentication...`);
        });
    });
});