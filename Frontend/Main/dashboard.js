/// User authentication configuration
const USER_CONFIG = {
    tokenKey: 'spendsavvy_token',
    userKey: 'spendsavvy_user',
    apiBase: 'http://localhost:3000/api'
};

// Application state
let transactions = [];
let budgets = [];

// Check authentication and load user data
function initializeUserAuth() {
    const token = localStorage.getItem(USER_CONFIG.tokenKey);
    const userData = localStorage.getItem(USER_CONFIG.userKey);

    if (!token || !userData) {
        window.location.href = '../Signin/signin.html';
        return null;
    }

    try {
        const user = JSON.parse(userData);
        displayUserData(user);
        return user;
    } catch (error) {
        console.error('Error loading user data:', error);
        logout();
        return null;
    }
}

// Display user data throughout the dashboard
function displayUserData(user) {
    // Update all user display elements
    document.querySelectorAll('[id^="userDisplayName"]').forEach(element => {
        element.textContent = user.name;
    });
    
    document.querySelectorAll('[id^="userAvatar"]').forEach(img => {
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4361ee&color=fff`;
    });
    
    // Update settings form
    const userNameInput = document.getElementById('userNameInput');
    const userEmailInput = document.getElementById('userEmailInput');
    
    if (userNameInput) userNameInput.value = user.name;
    if (userEmailInput) userEmailInput.value = user.email;
}

// Logout function
function logout() {
    localStorage.removeItem(USER_CONFIG.tokenKey);
    localStorage.removeItem(USER_CONFIG.userKey);
    window.location.href ='../Signin/signin.html';
}

// Get user-specific storage key
function getUserStorageKey(key) {
    const user = JSON.parse(localStorage.getItem(USER_CONFIG.userKey) || '{}');
    return `${key}_${user.id || 'default'}`;
}

// Load user data from localStorage
function loadUserData() {
    const transactionsData = localStorage.getItem(getUserStorageKey('transactions'));
    const budgetsData = localStorage.getItem(getUserStorageKey('budgets'));
    
    transactions = transactionsData ? JSON.parse(transactionsData) : [];
    budgets = budgetsData ? JSON.parse(budgetsData) : [];
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem(getUserStorageKey('transactions'), JSON.stringify(transactions));
    localStorage.setItem(getUserStorageKey('budgets'), JSON.stringify(budgets));
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple alert for now - we'll enhance this later
    alert(message);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing SpendSavvy Dashboard...');
    
    // Step 1: Authenticate user
    const user = initializeUserAuth();
    if (!user) return;
    
    console.log('User authenticated:', user.name);
    
    // Step 2: Load user data
    loadUserData();
    console.log('Loaded transactions:', transactions.length);
    console.log('Loaded budgets:', budgets.length);
    
    // Step 3: Initialize navigation
    initializeNavigation();
    
    // Step 4: Initialize event listeners
    initializeEventListeners();
    
    // Step 5: Update UI based on loaded data
    updateUI();
});

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Skip if it's the logout button
            if (this.id === 'logoutBtn') return;
            
            const pageId = this.getAttribute('data-page');
            console.log('Navigating to:', pageId);

            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId) {
                    page.classList.add('active');
                }
            });
            
            // Update the specific page content
            updatePageContent(pageId);
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
    
    // Add transaction buttons
    const addTransactionBtns = ['addTransactionBtn', 'addFirstTransaction', 'addFirstTransaction2'];
    addTransactionBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', openAddTransactionModal);
        }
    });
    
    // Add budget buttons
    const addBudgetBtns = ['addBudgetBtn', 'setFirstBudget', 'setFirstBudget2'];
    addBudgetBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', openAddBudgetModal);
        }
    });
    
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
}

// Update UI based on current data
function updateUI() {
    updateDashboard();
    updateTransactionsPage();
    updateBudgetsPage();
    updateReportsPage();
}

// Update dashboard page
function updateDashboard() {
    // Calculate totals
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalBalance = totalIncome - totalExpenses;
    
    // Update card values
    document.getElementById('totalBalance').textContent = `Ksh${totalBalance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `Ksh${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `Ksh${totalExpenses.toFixed(2)}`;
    
    // Show/hide empty state
    const emptyState = document.getElementById('dashboardEmptyState');
    if (transactions.length === 0 && budgets.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}

// Update transactions page
function updateTransactionsPage() {
    const emptyState = document.getElementById('transactionsEmptyState');
    const table = document.getElementById('transactionsTable');
    
    if (transactions.length === 0) {
        emptyState.style.display = 'block';
        table.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        table.style.display = 'block';
        // TODO: Render transactions table
    }
}

// Update budgets page
function updateBudgetsPage() {
    const emptyState = document.getElementById('budgetsEmptyState');
    const content = document.getElementById('budgetsContent');
    
    if (budgets.length === 0) {
        emptyState.style.display = 'block';
        content.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        content.style.display = 'block';
        // TODO: Render budgets
    }
}

// Update reports page
function updateReportsPage() {
    const emptyState = document.getElementById('reportsEmptyState');
    const content = document.getElementById('reportsContent');
    
    if (transactions.length === 0) {
        emptyState.style.display = 'block';
        content.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        content.style.display = 'block';
        // TODO: Render reports
    }
}

// Update specific page content when navigated to
function updatePageContent(pageId) {
    switch(pageId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            updateTransactionsPage();
            break;
        case 'budgets':
            updateBudgetsPage();
            break;
        case 'reports':
            updateReportsPage();
            break;
    }
}

// Modal functions (to be implemented)
function openAddTransactionModal() {
    showNotification('Add Transaction feature coming soon!');
}

function openAddBudgetModal() {
    showNotification('Add Budget feature coming soon!');
}

function saveProfile() {
    showNotification('Profile save feature coming soon!');
}