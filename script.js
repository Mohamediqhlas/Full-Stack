    const STORAGE_KEY = 'pf_expenses_v1';
	const form = document.getElementById('expense-form');
	const nameInput = document.getElementById('name');
	const amountInput = document.getElementById('amount');
	const categoryInput = document.getElementById('category');
	const dateInput = document.getElementById('date');
	const addBtn = document.getElementById('add-btn');
	const clearBtn = document.getElementById('clear-btn');

	const transactionsContainer = document.getElementById('transactions');
	const totalEl = document.getElementById('total');
	const byCategoryEl = document.getElementById('by-category');

	
	let expenses = [];

	
	const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

	function save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
	}

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			expenses = raw ? JSON.parse(raw) : [];
			
			expenses = expenses.map(e => ({ ...e, date: e.date }));
		} catch (err) {
			console.error('Failed to load expenses from storage', err);
			expenses = [];
		}
	}

	function formatDate(d) {
		if (!d) return '';
		const date = new Date(d);
		if (isNaN(date)) return d;
		return date.toLocaleDateString();
	}

	function renderList() {
        const items = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (items.length === 0) {
            transactionsContainer.innerHTML = '<tr><td colspan="5" style="text-align: center;">No transactions yet. Add your first expense!</td></tr>';
            return;
        }

        transactionsContainer.innerHTML = items.map(item => transactionHtml(item)).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                deleteExpense(id);
            });
        });
    }

    function transactionHtml(item) {
        const amt = currency.format(Number(item.amount));
        return `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${amt}</td>
                <td>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `;
    }

	function escapeHtml(text) {
		const el = document.createElement('div');
		el.textContent = text;
		return el.innerHTML;
	}

	function updateTotals() {
        const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        totalEl.textContent = currency.format(total);

        const byCat = {};
        expenses.forEach(e => {
            const cat = e.category || 'Other';
            byCat[cat] = (byCat[cat] || 0) + Number(e.amount || 0);
        });

        const rows = Object.keys(byCat).length
            ? Object.entries(byCat)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `
                    <tr>
                        <td>${escapeHtml(cat)}</td>
                        <td>${currency.format(amt)}</td>
                    </tr>
                `).join('')
            : '<tr><td colspan="2" style="text-align: center;">No data available</td></tr>';

        byCategoryEl.innerHTML = rows;
    }

function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function addExpense({ name, amount, category, date }) {
        const expense = {
            id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
            name: name.trim(),
            amount: Number(amount).toFixed(2),
            category: category || 'Other',
            date: date || new Date().toISOString().slice(0, 10),
        };

        expenses.push(expense);
        save();
        render();
        showNotification('Expense added successfully!');
    }	function deleteExpense(id) {
		const idx = expenses.findIndex(e => e.id === id);
		if (idx === -1) return;
		if (!confirm('Delete this expense?')) return;
		expenses.splice(idx, 1);
		save();
		render();
	}

	function clearAll() {
		if (!expenses.length) return;
		if (!confirm('Clear ALL expenses? This cannot be undone.')) return;
		expenses = [];
		save();
		render();
	}

	function validateInputs(name, amount, date) {
		if (!name || !name.trim()) return 'Name is required.';
		if (amount === '' || amount === null || isNaN(Number(amount))) return 'Amount must be a number.';
		if (Number(amount) < 0) return 'Amount cannot be negative.';
		if (!date) return 'Date is required.';
		return '';
	}

	function render() {
		renderList();
		updateTotals();
	}

	// Form submit
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const name = nameInput.value;
		const amount = amountInput.value;
		const category = categoryInput.value;
		const date = dateInput.value;

		const error = validateInputs(name, amount, date);
		if (error) {
			alert(error);
			return;
		}

		addExpense({ name, amount, category, date });

		
		nameInput.value = '';
		amountInput.value = '';
		dateInput.value = '';
		categoryInput.selectedIndex = 0;
		nameInput.focus();
	});

	clearBtn.addEventListener('click', () => clearAll());

	
	load();
	render();

	
window.PF = {
	get all() { return expenses; },
	clear: clearAll,
	add: addExpense,
};

