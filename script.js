const STORAGE_KEY = "pf_expenses_v1";
const form = document.getElementById("expense-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const clearBtn = document.getElementById("clear-btn");
const transactions = document.getElementById("transactions");
const totalEl = document.getElementById("total");
const byCategoryEl = document.getElementById("by-category");
let expenses = [];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}
function loadExpenses() {
  const data = localStorage.getItem(STORAGE_KEY);
  expenses = data ? JSON.parse(data) : [];
}
function addExpense(name, amount, category, date) {
  const expense = {
    id: Date.now().toString(),
    name: name.trim(),
    amount: parseFloat(amount).toFixed(2),
    category: category || "Other",
    date: date || new Date().toISOString().slice(0, 10),
  };
  expenses.push(expense);
  saveExpenses();
  render();
  showMessage("Expense added!");
}
function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses();
  render();
}
function clearAll() {
  if (!confirm("Clear all expenses?")) return;
  expenses = [];
  saveExpenses();
  render();
}
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
function showMessage(text) {
  const note = document.createElement("div");
  note.className = "notification";
  note.textContent = text;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 2000);
}
function render() {
  renderList();
  updateTotals();
}
function renderList() {
  if (expenses.length === 0) {
    transactions.innerHTML = `<tr><td colspan="5" style="text-align:center;">No expenses yet</td></tr>`;
    return;
  }
  transactions.innerHTML = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => `
      <tr>
        <td>${e.name}</td>
        <td>${e.category}</td>
        <td>${formatDate(e.date)}</td>
        <td>${currency.format(e.amount)}</td>
        <td><button onclick="deleteExpense('${e.id}')">Delete</button></td>
      </tr>
    `)
    .join("");
}
function updateTotals() {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  totalEl.textContent = currency.format(total);
  const byCat = {};
  expenses.forEach(e => {
    byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
  });
  byCategoryEl.innerHTML = Object.keys(byCat).length
    ? Object.entries(byCat)
        .map(([cat, amt]) => `<tr><td>${cat}</td><td>${currency.format(amt)}</td></tr>`)
        .join("")
    : `<tr><td colspan="2" style="text-align:center;">No category data</td></tr>`;
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = nameInput.value;
  const amount = amountInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;
  if (!name.trim()) return alert("Please enter a name");
  if (amount === "" || isNaN(amount) || amount < 0) return alert("Invalid amount");
  if (!date) return alert("Please select a date");
  addExpense(name, amount, category, date);
  form.reset();
  nameInput.focus();
});
clearBtn.addEventListener("click", clearAll);
loadExpenses();
render();
