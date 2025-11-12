
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

        // Chart.js Implementation
        // Category Chart
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        const categoryChart = new Chart(categoryCtx, {
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

        // Comparison Chart
        const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
        const comparisonChart = new Chart(comparisonCtx, {
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

        // Report Charts
        const reportCategoryCtx = document.getElementById('reportCategoryChart').getContext('2d');
        const reportCategoryChart = new Chart(reportCategoryCtx, {
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

        const monthlyTrendsCtx = document.getElementById('monthlyTrendsChart').getContext('2d');
        const monthlyTrendsChart = new Chart(monthlyTrendsCtx, {
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

        // Modal Handling
        const transactionModal = document.getElementById('transactionModal');
        const budgetModal = document.getElementById('budgetModal');
        const addTransactionBtns = document.querySelectorAll('#addTransactionBtn, #addTransactionBtn2');
        const addBudgetBtns = document.querySelectorAll('#addBudgetBtn, #addBudgetBtn2');
        const closeButtons = document.querySelectorAll('.close');
        const cancelButtons = document.querySelectorAll('.btn-secondary');

        // Open transaction modal
        addTransactionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                transactionModal.style.display = 'flex';
            });
        });

        // Open budget modal
        addBudgetBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                budgetModal.style.display = 'flex';
            });
        });

        // Close modals
        function closeModals() {
            transactionModal.style.display = 'none';
            budgetModal.style.display = 'none';
        }

        closeButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });

        cancelButtons.forEach(button => {
            if (button.textContent === 'Cancel') {
                button.addEventListener('click', closeModals);
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === transactionModal) {
                transactionModal.style.display = 'none';
            }
            if (event.target === budgetModal) {
                budgetModal.style.display = 'none';
            }
        });

        // Form submissions
        document.getElementById('transactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Transaction added successfully!');
            closeModals();
        });

        document.getElementById('budgetForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Budget set successfully!');
            closeModals();
        });
    });

