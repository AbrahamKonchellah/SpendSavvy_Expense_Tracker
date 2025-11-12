// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');

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
        });
    });

    // Transaction Data Management
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [
        {
            id: 1,
            date: '2023-10-15',
            description: 'Grocery Shopping',
            category: 'food',
            amount: -85.50,
            type: 'expense',
            notes: ''
        },
        {
            id: 2,
            date: '2023-10-14',
            description: 'Salary Deposit',
            category: 'income',
            amount: 2500.00,
            type: 'income',
            notes: ''
        },
        {
            id: 3,
            date: '2023-10-12',
            description: 'Gas Station',
            category: 'transport',
            amount: -45.00,
            type: 'expense',
            notes: ''
        }
    ];

    // Budget Data Management
    let budgets = JSON.parse(localStorage.getItem('budgets')) || [
        {
            id: 1,
            category: 'food',
            amount: 500,
            period: 'monthly',
            spent: 450
        },
        {
            id: 2,
            category: 'transport',
            amount: 200,
            period: 'monthly',
            spent: 120
        },
        {
            id: 3,
            category: 'entertainment',
            amount: 150,
            period: 'monthly',
            spent: 180
        },
        {
            id: 4,
            category: 'shopping',
            amount: 400,
            period: 'monthly',
            spent: 300
        },
        {
            id: 5,
            category: 'bills',
            amount: 250,
            period: 'monthly',
            spent: 180
        },
        {
            id: 6,
            category: 'health',
            amount: 150,
            period: 'monthly',
            spent: 75
        }
    ];

    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        renderTransactions();
        updateBudgetsSpent(); // Update budget spent amounts when transactions change
        renderBudgets();
    }

    // Save budgets to localStorage
    function saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(budgets));
        renderBudgets();
        updateDashboard();
    }

    // Update spent amounts in budgets based on transactions
    function updateBudgetsSpent() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        budgets.forEach(budget => {
            const spent = transactions
                .filter(transaction =>
                    transaction.type === 'expense' &&
                    transaction.category === budget.category &&
                    new Date(transaction.date).getMonth() === currentMonth &&
                    new Date(transaction.date).getFullYear() === currentYear
                )
                .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

            budget.spent = spent;
        });
        saveBudgets();
    }

    // Generate unique ID
    function generateId(items) {
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }

    // Format currency
    function formatCurrency(amount) {
        return `Ksh${Math.abs(amount).toFixed(2)}`;
    }

    // Format date for display
    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Get category display name and class
    function getCategoryInfo(category) {
        const categories = {
            'food': { name: 'Food & Dining', class: 'food' },
            'transport': { name: 'Transportation', class: 'transport' },
            'shopping': { name: 'Shopping', class: 'shopping' },
            'entertainment': { name: 'Entertainment', class: 'entertainment' },
            'bills': { name: 'Bills & Utilities', class: 'bills' },
            'health': { name: 'Healthcare', class: 'health' },
            'income': { name: 'Income', class: '' },
            'other': { name: 'Other', class: 'other' }
        };
        return categories[category] || { name: 'Other', class: 'other' };
    }

    // Get progress bar class based on percentage
    function getProgressClass(percentage) {
        if (percentage >= 100) return 'progress-danger';
        if (percentage >= 80) return 'progress-warning';
        return 'progress-safe';
    }

    // Render transactions table
    function renderTransactions() {
        const transactionTables = document.querySelectorAll('#transactions tbody, #dashboard tbody');

        transactionTables.forEach(table => {
            if (!table) return;

            table.innerHTML = '';

            // Sort transactions by date (newest first)
            const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedTransactions.forEach(transaction => {
                const categoryInfo = getCategoryInfo(transaction.category);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDisplayDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td><span class="category ${categoryInfo.class}">${categoryInfo.name}</span></td>
                    <td class="${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </td>
                    <td class="actions">
                        <i class="fas fa-edit" data-id="${transaction.id}"></i>
                        <i class="fas fa-trash" data-id="${transaction.id}"></i>
                    </td>
                `;
                table.appendChild(row);
            });
        });

        // Add event listeners for edit and delete buttons
        setTimeout(() => {
            document.querySelectorAll('.fa-edit').forEach(icon => {
                icon.addEventListener('click', function() {
                    const transactionId = parseInt(this.getAttribute('data-id'));
                    openEditTransactionModal(transactionId);
                });
            });

            document.querySelectorAll('.fa-trash').forEach(icon => {
                icon.addEventListener('click', function() {
                    const transactionId = parseInt(this.getAttribute('data-id'));
                    deleteTransaction(transactionId);
                });
            });
        }, 100);
    }

    // Render budgets
    function renderBudgets() {
        const budgetContainers = document.querySelectorAll('.budget-cards');

        budgetContainers.forEach(container => {
            if (!container) return;

            container.innerHTML = '';

            budgets.forEach(budget => {
                const categoryInfo = getCategoryInfo(budget.category);
                const percentage = (budget.spent / budget.amount) * 100;
                const progressClass = getProgressClass(percentage);
                const remaining = budget.amount - budget.spent;
                const statusText = remaining >= 0 ?
                    `${formatCurrency(remaining)} remaining` :
                    `${formatCurrency(Math.abs(remaining))} over budget`;

                const budgetCard = document.createElement('div');
                budgetCard.className = 'budget-card';
                budgetCard.innerHTML = `
                    <div class="budget-header">
                        <div class="budget-title">${categoryInfo.name}</div>
                        <div class="budget-amount">${formatCurrency(budget.spent)} / ${formatCurrency(budget.amount)}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-status">${statusText}</div>
                    <div class="budget-actions" style="margin-top: 10px; display: flex; gap: 10px;">
                        <button class="btn btn-secondary edit-budget" data-id="${budget.id}" style="padding: 4px 8px; font-size: 12px;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary delete-budget" data-id="${budget.id}" style="padding: 4px 8px; font-size: 12px; background-color: var(--danger);">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;
                container.appendChild(budgetCard);
            });
        });

        // Add event listeners for budget buttons
        setTimeout(() => {
            document.querySelectorAll('.edit-budget').forEach(button => {
                button.addEventListener('click', function() {
                    const budgetId = parseInt(this.getAttribute('data-id'));
                    openEditBudgetModal(budgetId);
                });
            });

            document.querySelectorAll('.delete-budget').forEach(button => {
                button.addEventListener('click', function() {
                    const budgetId = parseInt(this.getAttribute('data-id'));
                    deleteBudget(budgetId);
                });
            });
        }, 100);
    }

    // Update dashboard summary
    function updateDashboard() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalBalance = totalIncome - totalExpenses;

        // Calculate remaining budget (sum of all positive remaining amounts)
        const totalRemainingBudget = budgets.reduce((sum, budget) => {
            const remaining = budget.amount - budget.spent;
            return sum + Math.max(0, remaining);
        }, 0);

        // Update dashboard cards
        const balanceCard = document.querySelector('.card.balance .card-value');
        const incomeCard = document.querySelector('.card.income .card-value');
        const expenseCard = document.querySelector('.card.expense .card-value');
        const budgetCard = document.querySelector('.card.budget .card-value');

        if (balanceCard) balanceCard.textContent = formatCurrency(totalBalance);
        if (incomeCard) incomeCard.textContent = formatCurrency(totalIncome);
        if (expenseCard) expenseCard.textContent = formatCurrency(totalExpenses);
        if (budgetCard) budgetCard.textContent = formatCurrency(totalRemainingBudget);
    }

    // Create new transaction
    function createTransaction(transactionData) {
        const newTransaction = {
            id: generateId(transactions),
            ...transactionData
        };
        transactions.push(newTransaction);
        saveTransactions();
        showNotification('Transaction added successfully!', 'success');
    }

    // Update existing transaction
    function updateTransaction(transactionId, transactionData) {
        const index = transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...transactionData };
            saveTransactions();
            showNotification('Transaction updated successfully!', 'success');
        }
    }

    // Delete transaction
    function deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(t => t.id !== transactionId);
            saveTransactions();
            showNotification('Transaction deleted successfully!', 'success');
        }
    }

    // Create new budget
    function createBudget(budgetData) {
        // Check if budget already exists for this category
        const existingBudget = budgets.find(b => b.category === budgetData.category && b.period === budgetData.period);
        if (existingBudget) {
            if (confirm('A budget already exists for this category and period. Do you want to update it instead?')) {
                updateBudget(existingBudget.id, budgetData);
                return;
            } else {
                return;
            }
        }

        const newBudget = {
            id: generateId(budgets),
            spent: 0,
            ...budgetData
        };
        budgets.push(newBudget);
        saveBudgets();
        showNotification('Budget created successfully!', 'success');
    }

    // Update existing budget
    function updateBudget(budgetId, budgetData) {
        const index = budgets.findIndex(b => b.id === budgetId);
        if (index !== -1) {
            budgets[index] = { ...budgets[index], ...budgetData };
            saveBudgets();
            showNotification('Budget updated successfully!', 'success');
        }
    }

    // Delete budget
    function deleteBudget(budgetId) {
        if (confirm('Are you sure you want to delete this budget?')) {
            budgets = budgets.filter(b => b.id !== budgetId);
            saveBudgets();
            showNotification('Budget deleted successfully!', 'success');
        }
    }

    // Get transaction by ID
    function getTransactionById(transactionId) {
        return transactions.find(t => t.id === transactionId);
    }

    // Get budget by ID
    function getBudgetById(budgetId) {
        return budgets.find(b => b.id === budgetId);
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#f72585' : '#4361ee'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Modal Handling
    const transactionModal = document.getElementById('transactionModal');
    const budgetModal = document.getElementById('budgetModal');
    const closeButtons = document.querySelectorAll('.close');
    const cancelButtons = document.querySelectorAll('.btn-secondary');

    let currentEditingId = null;
    let currentEditingType = null; // 'transaction' or 'budget'

    // Open transaction modal for adding
    function openAddTransactionModal() {
        currentEditingId = null;
        currentEditingType = 'transaction';
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const modalTitle = modal.querySelector('.modal-title');

        modalTitle.textContent = 'Add Transaction';
        form.reset();

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        form.querySelector('input[type="date"]').value = today;

        modal.style.display = 'flex';
    }

    // Open transaction modal for editing
    function openEditTransactionModal(transactionId) {
        currentEditingId = transactionId;
        currentEditingType = 'transaction';
        const transaction = getTransactionById(transactionId);
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const modalTitle = modal.querySelector('.modal-title');

        if (transaction) {
            modalTitle.textContent = 'Edit Transaction';
            form.querySelector('input[placeholder="Enter description"]').value = transaction.description;
            form.querySelector('input[type="number"]').value = Math.abs(transaction.amount);
            form.querySelector('input[type="date"]').value = transaction.date;
            form.querySelector('select').value = transaction.type;
            form.querySelectorAll('select')[1].value = transaction.category;
            form.querySelector('textarea').value = transaction.notes || '';

            modal.style.display = 'flex';
        }
    }

    // Open budget modal for adding
    function openAddBudgetModal() {
        currentEditingId = null;
        currentEditingType = 'budget';
        const modal = document.getElementById('budgetModal');
        const form = document.getElementById('budgetForm');
        const modalTitle = modal.querySelector('.modal-title');

        modalTitle.textContent = 'Set New Budget';
        form.reset();
        modal.style.display = 'flex';
    }

    // Open budget modal for editing
    function openEditBudgetModal(budgetId) {
        currentEditingId = budgetId;
        currentEditingType = 'budget';
        const budget = getBudgetById(budgetId);
        const modal = document.getElementById('budgetModal');
        const form = document.getElementById('budgetForm');
        const modalTitle = modal.querySelector('.modal-title');

        if (budget) {
            modalTitle.textContent = 'Edit Budget';
            form.querySelector('select').value = budget.category;
            form.querySelector('input[type="number"]').value = budget.amount;
            form.querySelectorAll('select')[1].value = budget.period;

            modal.style.display = 'flex';
        }
    }

    // Close modals
    function closeModals() {
        if (transactionModal) transactionModal.style.display = 'none';
        if (budgetModal) budgetModal.style.display = 'none';
        currentEditingId = null;
        currentEditingType = null;
    }

    // Initialize all event listeners
    function initializeEventListeners() {
        // Add transaction buttons
        document.querySelectorAll('#addTransactionBtn, #addTransactionBtn2').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', openAddTransactionModal);
            }
        });

        // Add budget buttons
        document.querySelectorAll('#addBudgetBtn, #addBudgetBtn2').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', openAddBudgetModal);
            }
        });

        // Close buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });

        // Cancel buttons
        cancelButtons.forEach(button => {
            if (button.textContent === 'Cancel' || button.textContent.includes('Cancel')) {
                button.addEventListener('click', closeModals);
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === transactionModal) {
                closeModals();
            }
            if (event.target === budgetModal) {
                closeModals();
            }
        });

        // Transaction form submission
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const description = this.querySelector('input[type="text"]').value;
                const amount = parseFloat(this.querySelector('input[type="number"]').value);
                const date = this.querySelector('input[type="date"]').value;
                const type = this.querySelector('select').value;
                const category = this.querySelectorAll('select')[1].value;
                const notes = this.querySelector('textarea').value;

                if (!description || !amount || !date || !type || !category) {
                    showNotification('Please fill in all required fields!', 'error');
                    return;
                }

                const transactionData = {
                    description: description,
                    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                    date: date,
                    type: type,
                    category: category,
                    notes: notes
                };

                if (currentEditingId && currentEditingType === 'transaction') {
                    updateTransaction(currentEditingId, transactionData);
                } else {
                    createTransaction(transactionData);
                }

                closeModals();
            });
        }

        // Budget form submission
        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const category = this.querySelector('select').value;
                const amount = parseFloat(this.querySelector('input[type="number"]').value);
                const period = this.querySelectorAll('select')[1].value;

                if (!category || !amount || !period) {
                    showNotification('Please fill in all required fields!', 'error');
                    return;
                }

                const budgetData = {
                    category: category,
                    amount: amount,
                    period: period
                };

                if (currentEditingId && currentEditingType === 'budget') {
                    updateBudget(currentEditingId, budgetData);
                } else {
                    createBudget(budgetData);
                }

                closeModals();
            });
        }
    }

    // Initialize the application
    function initializeApp() {
        initializeEventListeners();
        initializeCharts();
        renderTransactions();
        renderBudgets();
        updateDashboard();
        updateBudgetsSpent(); // Initialize spent amounts
    }

    // Chart initialization (your existing chart code)
    function initializeCharts() {
        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Other'],
                    datasets: [{
                        data: [35, 15, 20, 10, 15, 5],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }

        // Comparison Chart
        const comparisonCtx = document.getElementById('comparisonChart');
        if (comparisonCtx) {
            new Chart(comparisonCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [4500, 4700, 4800, 4900, 5000, 5200, 5300, 5400, 5500, 5800],
                            backgroundColor: '#4cc9f0',
                            borderWidth: 0
                        },
                        {
                            label: 'Expenses',
                            data: [3200, 3400, 3100, 3300, 3500, 3600, 3400, 3700, 3500, 3800],
                            backgroundColor: '#f72585',
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false
                            }
                        }
                    }
                }
            });
        }

        // Report Charts
        const reportCategoryCtx = document.getElementById('reportCategoryChart');
        if (reportCategoryCtx) {
            new Chart(reportCategoryCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Other'],
                    datasets: [{
                        data: [35, 15, 20, 10, 15, 5],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }

        const monthlyTrendsCtx = document.getElementById('monthlyTrendsChart');
        if (monthlyTrendsCtx) {
            new Chart(monthlyTrendsCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [4500, 4700, 4800, 4900, 5000, 5200, 5300, 5400, 5500, 5800],
                            borderColor: '#4cc9f0',
                            backgroundColor: 'rgba(76, 201, 240, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Expenses',
                            data: [3200, 3400, 3100, 3300, 3500, 3600, 3400, 3700, 3500, 3800],
                            borderColor: '#f72585',
                            backgroundColor: 'rgba(247, 37, 133, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Start the application
    initializeApp();
});