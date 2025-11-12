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

    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        renderTransactions();
        updateCharts();
    }

    // Generate unique ID
    function generateId() {
        return transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
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
            'food': { name: 'Food', class: 'food' },
            'transport': { name: 'Transport', class: 'transport' },
            'shopping': { name: 'Shopping', class: 'shopping' },
            'entertainment': { name: 'Entertainment', class: 'entertainment' },
            'bills': { name: 'Bills', class: 'bills' },
            'health': { name: 'Health', class: 'health' },
            'income': { name: 'Income', class: '' },
            'other': { name: 'Other', class: 'other' }
        };
        return categories[category] || { name: 'Other', class: 'other' };
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

    // Update dashboard summary
    function updateDashboard() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalBalance = totalIncome - totalExpenses;

        // Update dashboard cards
        const balanceCard = document.querySelector('.card.balance .card-value');
        const incomeCard = document.querySelector('.card.income .card-value');
        const expenseCard = document.querySelector('.card.expense .card-value');

        if (balanceCard) balanceCard.textContent = formatCurrency(totalBalance);
        if (incomeCard) incomeCard.textContent = formatCurrency(totalIncome);
        if (expenseCard) expenseCard.textContent = formatCurrency(totalExpenses);
    }

    // Update charts with real data
    function updateCharts() {
        // This would update charts with actual transaction data
        // For now, we'll keep the static data
    }

    // Create new transaction
    function createTransaction(transactionData) {
        const newTransaction = {
            id: generateId(),
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

    // Get transaction by ID
    function getTransactionById(transactionId) {
        return transactions.find(t => t.id === transactionId);
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
            background: ${type === 'success' ? '#28a745' : '#4361ee'};
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

    // Open transaction modal for adding
    function openAddTransactionModal() {
        currentEditingId = null;
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

    // Close modals
    function closeModals() {
        if (transactionModal) transactionModal.style.display = 'none';
        if (budgetModal) budgetModal.style.display = 'none';
        currentEditingId = null;
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
                btn.addEventListener('click', function() {
                    if (budgetModal) budgetModal.style.display = 'flex';
                });
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

                if (currentEditingId) {
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
                showNotification('Budget set successfully!', 'success');
                closeModals();
            });
        }
    }

    // Initialize the application
    function initializeApp() {
        initializeEventListeners();
        initializeCharts();
        renderTransactions();
        updateDashboard();
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