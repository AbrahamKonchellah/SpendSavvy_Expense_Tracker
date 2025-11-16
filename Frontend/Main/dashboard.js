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

    // Close modal buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    // Cancel buttons in modals
    document.querySelectorAll('.modal .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    // Transaction form submission
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    // Event delegation for transaction actions (edit/delete)
    const transactionsBody = document.getElementById('transactionsBody');
    if (transactionsBody) {
        transactionsBody.addEventListener('click', handleTransactionActions);
    }

    // Budget form submission
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleBudgetSubmit);
    }

    // Event delegation for budget actions (edit/delete)
    const budgetsContent = document.getElementById('budgetsContent');
    if (budgetsContent) {
        budgetsContent.addEventListener('click', handleBudgetActions);
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
        renderTransactionsTable();
    }
}

// Render transactions table
function renderTransactionsTable() {
    const transactionsBody = document.getElementById('transactionsBody');
    transactionsBody.innerHTML = ''; // Clear existing rows

    // Sort transactions by date in descending order
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(transaction => {
        const row = transactionsBody.insertRow();
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td><span class="category ${transaction.category}">${transaction.category}</span></td>
            <td class="${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                Ksh${transaction.amount.toFixed(2)}
            </td>
            <td class="actions">
                <i class="fas fa-edit" data-id="${transaction.id}"></i>
                <i class="fas fa-trash-alt" data-id="${transaction.id}"></i>
            </td>
        `;
    });
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
        renderBudgets();
    }
}

// Render budgets on the budgets page
function renderBudgets() {
    const budgetsContent = document.getElementById('budgetsContent');
    budgetsContent.innerHTML = ''; // Clear existing budgets

    budgets.forEach(budget => {
        const totalSpent = transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const remaining = budget.amount - totalSpent;
        const percentage = (totalSpent / budget.amount) * 100;

        let progressClass = 'progress-safe';
        if (percentage > 75 && percentage < 100) {
            progressClass = 'progress-warning';
        } else if (percentage >= 100) {
            progressClass = 'progress-danger';
        }

        const budgetCard = document.createElement('div');
        budgetCard.classList.add('budget-card');
        budgetCard.innerHTML = `
            <div class="budget-header">
                <div class="budget-title">${budget.category}</div>
                <div class="budget-amount">Ksh${budget.amount.toFixed(2)}</div>
            </div>
            <div class="progress-bar">
                <div class="progress ${progressClass}" style="width: ${Math.min(percentage, 100)}%;"></div>
            </div>
            <div class="budget-status">
                Ksh${remaining.toFixed(2)} remaining
            </div>
            <div class="actions">
                <i class="fas fa-edit" data-id="${budget.id}" data-type="budget"></i>
                <i class="fas fa-trash-alt" data-id="${budget.id}" data-type="budget"></i>
            </div>
        `;
        budgetsContent.appendChild(budgetCard);
    });
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
        renderSpendingChart();
        renderIncomeExpenseChart();
    }
}

// Render spending by category chart
let spendingChartInstance = null; // To store the chart instance

function renderSpendingChart() {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (spendingChartInstance) {
        spendingChartInstance.destroy();
    }

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categorySpending = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    const labels = Object.keys(categorySpending);
    const data = Object.values(categorySpending);

    spendingChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4361ee', '#3f37c9', '#4cc9f0', '#f72585', '#f8961e', '#4895ef', '#a29bfe', '#ffeaa7'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Spending by Category'
                }
            }
        }
    });
}

// Render income vs. expenses chart
let incomeExpenseChartInstance = null; // To store the chart instance

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

    // Destroy existing chart if it exists
    if (incomeExpenseChartInstance) {
        incomeExpenseChartInstance.destroy();
    }

    const monthlyData = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!acc[monthYear]) {
            acc[monthYear] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            acc[monthYear].income += t.amount;
        } else {
            acc[monthYear].expense += Math.abs(t.amount);
        }
        return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    const incomeData = sortedMonths.map(month => monthlyData[month].income);
    const expenseData = sortedMonths.map(month => monthlyData[month].expense);

    incomeExpenseChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#4cc9f0',
                    borderColor: '#4cc9f0',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#f72585',
                    borderColor: '#f72585',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Income vs. Expenses'
                }
            },
            scales: {
                x: {
                    stacked: false,
                },
                y: {
                    stacked: false
                }
            }
        }
    });
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

// Modal functions
const transactionModal = document.getElementById('transactionModal');
const budgetModal = document.getElementById('budgetModal');

function openModal(modal) {
    modal.style.display = 'flex';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

function openAddTransactionModal() {
    openModal(transactionModal);
}

function openAddBudgetModal() {
    openModal(budgetModal);
}

function saveProfile() {
    // This will be implemented later, for now, just show a notification
    showNotification('Profile save feature coming soon!');
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const description = form.querySelector('input[type="text"]').value;
    const amount = parseFloat(form.querySelector('input[type="number"]').value);
    const date = form.querySelector('input[type="date"]').value;
    const type = form.querySelector('select:nth-of-type(1)').value;
    const category = form.querySelector('select:nth-of-type(2)').value;

    if (!description || !amount || !date || !type || !category) {
        showNotification('Please fill in all transaction fields.', 'error');
        return;
    }

    const newTransaction = {
        id: Date.now(), // Simple unique ID
        description,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount), // Ensure expense is negative
        date,
        type,
        category
    };

    transactions.push(newTransaction);
    saveUserData();
    closeModal(transactionModal);
    form.reset(); // Clear the form
    updateUI();
    showNotification('Transaction added successfully!', 'success');
}

// Handle transaction edit/delete actions
function handleTransactionActions(e) {
    const target = e.target;
    const transactionId = parseInt(target.dataset.id);

    if (target.classList.contains('fa-trash-alt')) {
        // Delete transaction
        if (confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(t => t.id !== transactionId);
            saveUserData();
            updateUI();
            showNotification('Transaction deleted successfully!', 'success');
        }
    } else if (target.classList.contains('fa-edit')) {
        // Edit transaction (for now, just a placeholder)
        showNotification('Edit transaction feature coming soon!', 'info');
    }
}

// Handle budget form submission
function handleBudgetSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const category = form.querySelector('select').value;
    const amount = parseFloat(form.querySelector('input[type="number"]').value);

    if (!category || !amount) {
        showNotification('Please fill in all budget fields.', 'error');
        return;
    }

    const newBudget = {
        id: Date.now(),
        category,
        amount
    };

    budgets.push(newBudget);
    saveUserData();
    closeModal(budgetModal);
    form.reset();
    updateUI();
    showNotification('Budget set successfully!', 'success');
}

// Handle budget edit/delete actions
function handleBudgetActions(e) {
    const target = e.target;
    const budgetId = parseInt(target.dataset.id);

    if (target.classList.contains('fa-trash-alt')) {
        // Delete budget
        if (confirm('Are you sure you want to delete this budget?')) {
            budgets = budgets.filter(b => b.id !== budgetId);
            saveUserData();
            updateUI();
            showNotification('Budget deleted successfully!', 'success');
        }
    } else if (target.classList.contains('fa-edit')) {
        // Edit budget (for now, just a placeholder)
        showNotification('Edit budget feature coming soon!', 'info');
    }
}
