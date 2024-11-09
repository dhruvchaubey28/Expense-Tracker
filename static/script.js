document.addEventListener('DOMContentLoaded', () => {
    const addExpenseButton = document.getElementById('add-expense-button');
    const viewExpensesButton = document.getElementById('view-expenses-button');
    const viewBudgetsButton = document.getElementById('view-budgets-button');
    const getInsightsButton = document.getElementById('get-insights-button');

    // Add Expense
    addExpenseButton.addEventListener('click', () => {
        const description = document.getElementById('expense-description').value;
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;

        fetch('/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description, amount, category }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || data.error);
            document.getElementById('expense-description').value = '';
            document.getElementById('expense-amount').value = '';
            document.getElementById('expense-category').value = '';
        })
        .catch((error) => console.error('Error:', error));
    });

    // View Expenses
    viewExpensesButton.addEventListener('click', () => {
        fetch('/get_expenses')
            .then(response => response.json())
            .then(data => {
                const expenseList = document.getElementById('expense-list');
                expenseList.innerHTML = '';
                data.forEach(expense => {
                    const li = document.createElement('li');
                    li.textContent = `${expense.description} - $${expense.amount} (${expense.category}) on ${new Date(expense.date).toLocaleDateString()}`;
                    expenseList.appendChild(li);
                });
            })
            .catch((error) => console.error('Error:', error));
    });

    // View Budgets
    viewBudgetsButton.addEventListener('click', () => {
        fetch('/get_budget')
            .then(response => response.json())
            .then(data => {
                const budgetList = document.getElementById('budget-list');
                budgetList.innerHTML = '';
                data.forEach(budget => {
                    const li = document.createElement('li');
                    li.textContent = `${budget.category} - $${budget.amount}`;
                    budgetList.appendChild(li);
                });
            })
            .catch((error) => console.error('Error:', error));
    });

    // Get Insights and visualize data
    getInsightsButton.addEventListener('click', () => {
        fetch('/get_insights')
            .then(response => response.json())
            .then(data => {
                const insightsChart = document.getElementById('insights-chart');
                const labels = data.map(insight => insight._id);
                const totals = data.map(insight => insight.total);

                const ctx = insightsChart.getContext('2d');
                const chart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Expense Insights',
                            data: totals,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Expense Breakdown by Category'
                            }
                        }
                    }
                });
            })
            .catch((error) => console.error('Error:', error));
    });

    // Set Budget
    document.getElementById('set-budget-button').addEventListener('click', () => {
        const category = document.getElementById('budget-category').value;
        const amount = document.getElementById('budget-amount').value;

        fetch('/set_budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, amount }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || data.error);
            document.getElementById('budget-category').value = '';
            document.getElementById('budget-amount').value = '';
        })
        .catch((error) => console.error('Error:', error));
    });
});
