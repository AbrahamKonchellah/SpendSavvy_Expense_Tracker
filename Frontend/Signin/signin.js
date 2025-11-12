document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabName}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Switch between login and signup forms
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab[data-tab="signup"]').click();
    });

    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tab[data-tab="login"]').click();
    });

    // Form submission handling
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real application, you would validate and send to server
        alert('Login successful! Redirecting to dashboard...');
        window.location.href = '../Main/dashboard.html';
    });

    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = this.querySelector('input[type="password"]').value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // In a real application, you would send to server
        alert('Account created successfully! Please log in.');
        document.querySelector('.tab[data-tab="login"]').click();
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('google') ? 'Google' : 'Facebook';
            alert(`Redirecting to ${platform} authentication...`);
        });
    });
});