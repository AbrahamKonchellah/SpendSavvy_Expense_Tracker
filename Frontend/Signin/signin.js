// Authentication configuration
const AUTH_CONFIG = {
    tokenKey: 'spendsavvy_token',
    userKey: 'spendsavvy_user',
    apiBase: 'http://localhost:3000/api'
};

// Check if user is already logged in
if (localStorage.getItem(AUTH_CONFIG.tokenKey)) {
    window.location.href = '../Main/dashboard.html';
}

// Professional Error Handling System
const ErrorHandler = {
    // Show field-specific error
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        const inputGroup = inputElement.closest('.input-group');
        
        if (errorElement && inputGroup) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            inputGroup.classList.add('error');
            inputGroup.classList.remove('success');
        }
    },

    // Clear field error
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        const inputGroup = inputElement?.closest('.input-group');
        
        if (errorElement && inputGroup) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            inputGroup.classList.remove('error');
        }
    },

    // Show field success state
    showFieldSuccess(fieldId) {
        const inputElement = document.getElementById(fieldId);
        const inputGroup = inputElement?.closest('.input-group');
        
        if (inputGroup) {
            inputGroup.classList.add('success');
            inputGroup.classList.remove('error');
            this.clearFieldError(fieldId);
        }
    },

    // Clear all errors in form
    clearAllFormErrors(formId) {
        const form = document.getElementById(formId);
        const errors = form.querySelectorAll('.field-error');
        const inputGroups = form.querySelectorAll('.input-group');
        
        errors.forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });
        
        inputGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
};

// Toast Notification System
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        return toast;
    }
};

// Form Validation System
const Validator = {
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    password(password) {
        return password.length >= 8;
    },

    name(name) {
        return name.trim().length >= 2;
    },

    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }
};

// UI State Management
const UIState = {
    setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        button.disabled = isLoading;
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'block';
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    },

    validateFormRealTime(inputId, validator) {
        const input = document.getElementById(inputId);
        
        input.addEventListener('blur', () => {
            const value = input.value.trim();
            
            if (!value) {
                ErrorHandler.clearFieldError(inputId);
                return;
            }
            
            if (validator(value)) {
                ErrorHandler.showFieldSuccess(inputId);
            } else {
                let message = '';
                switch(input.type) {
                    case 'email':
                        message = 'Please enter a valid email address';
                        break;
                    case 'password':
                        if (inputId.includes('signupPassword')) {
                            message = 'Password must be at least 8 characters';
                        } else if (inputId.includes('Confirm')) {
                            message = 'Passwords do not match';
                        }
                        break;
                    case 'text':
                        message = 'Name must be at least 2 characters';
                        break;
                }
                ErrorHandler.showFieldError(inputId, message);
            }
        });
    }
};

// Authentication Logic
const AuthService = {
    async login(credentials) {
        const response = await fetch(`${AUTH_CONFIG.apiBase}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        return { response, data };
    },

    async signup(userData) {
        const response = await fetch(`${AUTH_CONFIG.apiBase}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        return { response, data };
    },

    storeAuthData(token, user) {
        localStorage.setItem(AUTH_CONFIG.tokenKey, token);
        localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    }
};

// Form Handlers
const FormHandler = {
    // Login form handler
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Clear previous errors
        ErrorHandler.clearAllFormErrors('loginForm');
        
        // Client-side validation
        let hasErrors = false;
        
        if (!email) {
            ErrorHandler.showFieldError('loginEmail', 'Email is required');
            hasErrors = true;
        } else if (!Validator.email(email)) {
            ErrorHandler.showFieldError('loginEmail', 'Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!password) {
            ErrorHandler.showFieldError('loginPassword', 'Password is required');
            hasErrors = true;
        }
        
        if (hasErrors) {
            Toast.show('Please fix the errors above', 'error');
            return;
        }
        
        // Show loading state
        UIState.setLoading('loginBtn', true);
        
        try {
            const { response, data } = await AuthService.login({ email, password });
            
            if (response.ok && data.success) {
                AuthService.storeAuthData(data.token, data.user);
                
                // Show success and redirect
                ErrorHandler.showFieldSuccess('loginEmail');
                ErrorHandler.showFieldSuccess('loginPassword');
                Toast.show('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '../Main/dashboard.html';
                }, 1500);
                
            } else {
                // Server returned error
                const message = data.message || 'Login failed';
                Toast.show(message, 'error');
                
                // Highlight problematic fields
                if (message.toLowerCase().includes('email')) {
                    ErrorHandler.showFieldError('loginEmail', message);
                } else if (message.toLowerCase().includes('password')) {
                    ErrorHandler.showFieldError('loginPassword', message);
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            Toast.show('Network error. Please check if server is running.', 'error');
        } finally {
            UIState.setLoading('loginBtn', false);
        }
    },

    // Signup form handler
    async handleSignup(event) {
        event.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        // Clear previous errors
        ErrorHandler.clearAllFormErrors('signupForm');
        
        // Client-side validation
        let hasErrors = false;
        
        if (!name) {
            ErrorHandler.showFieldError('signupName', 'Full name is required');
            hasErrors = true;
        } else if (!Validator.name(name)) {
            ErrorHandler.showFieldError('signupName', 'Name must be at least 2 characters');
            hasErrors = true;
        }
        
        if (!email) {
            ErrorHandler.showFieldError('signupEmail', 'Email is required');
            hasErrors = true;
        } else if (!Validator.email(email)) {
            ErrorHandler.showFieldError('signupEmail', 'Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!password) {
            ErrorHandler.showFieldError('signupPassword', 'Password is required');
            hasErrors = true;
        } else if (!Validator.password(password)) {
            ErrorHandler.showFieldError('signupPassword', 'Password must be at least 8 characters');
            hasErrors = true;
        }
        
        if (!confirmPassword) {
            ErrorHandler.showFieldError('signupConfirmPassword', 'Please confirm your password');
            hasErrors = true;
        } else if (!Validator.passwordsMatch(password, confirmPassword)) {
            ErrorHandler.showFieldError('signupConfirmPassword', 'Passwords do not match');
            hasErrors = true;
        }
        
        if (!termsAccepted) {
            ErrorHandler.showFieldError('terms', 'You must accept the Terms & Conditions');
            hasErrors = true;
        }
        
        if (hasErrors) {
            Toast.show('Please fix the errors above', 'error');
            return;
        }
        
        // Show loading state
        UIState.setLoading('signupBtn', true);
        
        try {
            const { response, data } = await AuthService.signup({ name, email, password });
            
            if (response.ok && data.success) {
                AuthService.storeAuthData(data.token, data.user);
                
                // Show success states
                ErrorHandler.showFieldSuccess('signupName');
                ErrorHandler.showFieldSuccess('signupEmail');
                ErrorHandler.showFieldSuccess('signupPassword');
                ErrorHandler.showFieldSuccess('signupConfirmPassword');
                
                Toast.show('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '../Main/dashboard.html';
                }, 1500);
                
            } else {
                // Server returned error
                const message = data.message || 'Signup failed';
                Toast.show(message, 'error');
                
                // Highlight problematic fields
                if (message.toLowerCase().includes('email')) {
                    ErrorHandler.showFieldError('signupEmail', message);
                }
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            Toast.show('Network error. Please check if server is running.', 'error');
        } finally {
            UIState.setLoading('signupBtn', false);
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update forms
            forms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${targetTab}Form`).classList.add('active');
            
            // Clear all errors when switching tabs
            ErrorHandler.clearAllFormErrors('loginForm');
            ErrorHandler.clearAllFormErrors('signupForm');
        });
    });

    // Form switching links
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.tab[data-tab="signup"]').click();
    });

    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.tab[data-tab="login"]').click();
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', FormHandler.handleLogin);
    document.getElementById('signupForm').addEventListener('submit', FormHandler.handleSignup);

    // Real-time validation
    UIState.validateFormRealTime('loginEmail', Validator.email);
    UIState.validateFormRealTime('signupName', Validator.name);
    UIState.validateFormRealTime('signupEmail', Validator.email);
    UIState.validateFormRealTime('signupPassword', Validator.password);
    
    // Real-time password confirmation check
    document.getElementById('signupConfirmPassword').addEventListener('blur', function() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = this.value;
        
        if (confirmPassword && !Validator.passwordsMatch(password, confirmPassword)) {
            ErrorHandler.showFieldError('signupConfirmPassword', 'Passwords do not match');
        } else if (confirmPassword) {
            ErrorHandler.showFieldSuccess('signupConfirmPassword');
        }
    });

    
});