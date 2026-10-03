// Ambil data transaksi dari LocalStorage (jika ada, kalau belum kosongkan)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Inisialisasi Chart.js
const ctx = document.getElementById('expenseChart').getContext('2d');
let expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Food', 'Transport', 'Fun'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#f87171', '#60a5fa', '#facc15'],
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

// Fungsi untuk memperbarui tampilan aplikasi (Total Saldo, List, & Grafik)
function updateApp() {
    const listEl = document.getElementById('transaction-list');
    const totalBalanceEl = document.getElementById('total-balance');
    const sortSelect = document.getElementById('sort-select');

    listEl.innerHTML = '';
    let total = 0;
    let categoryTotals = { Food: 0, Transport: 0, Fun: 0 };

    // --- FITUR: Sort Transactions ---
    let displayedTransactions = [...transactions];
    if (sortSelect) {
        const sortValue = sortSelect.value;
        if (sortValue === 'amount-desc') {
            displayedTransactions.sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sortValue === 'amount-asc') {
            displayedTransactions.sort((a, b) => Number(a.amount) - Number(b.amount));
        } else if (sortValue === 'category') {
            displayedTransactions.sort((a, b) => a.category.localeCompare(b.category));
        }
    }

    if (displayedTransactions.length === 0) {
        listEl.innerHTML = `<p id="empty-message" class="text-gray-400 text-center py-4">Belum ada transaksi yang ditambahkan.</p>`;
    } else {
        displayedTransactions.forEach((trx) => {
            total += Number(trx.amount);
            categoryTotals[trx.category] += Number(trx.amount);

            // Cari index asli transaksi untuk tombol hapus
            const originalIndex = transactions.indexOf(trx);
            const li = document.createElement('li');
            li.className = "flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700";
            li.innerHTML = `
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-gray-100">${trx.name}</h4>
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium ${
                        trx.category === 'Food' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 
                        trx.category === 'Transport' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
                    }">
                        ${trx.category}
                    </span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="font-bold text-gray-700 dark:text-gray-200">Rp ${Number(trx.amount).toLocaleString('id-ID')}</span>
                    <button onclick="deleteTransaction(${originalIndex})" class="text-gray-400 hover:text-red-500 text-sm font-semibold p-1 transition">🗑️</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Update teks Total Balance
    totalBalanceEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    // --- FITUR: Highlight Spending Over Limit ---
    const spendingLimitInput = document.getElementById('spending-limit');
    const limitWarning = document.getElementById('limit-warning');
    const balanceEl = document.getElementById('total-balance');

    if (spendingLimitInput && limitWarning && balanceEl) {
        const limit = Number(spendingLimitInput.value);

        if (limit > 0) {
            if (total > limit) {
                limitWarning.textContent = "⚠️ Peringatan: Pengeluaran telah melebihi batas maksimal!";
                limitWarning.className = "text-xs font-bold mt-1 text-red-500 animate-pulse";
                balanceEl.className = "text-3xl font-bold text-red-600";
            } else {
                limitWarning.textContent = `✅ Aman: Batas maksimal Anda adalah Rp ${limit.toLocaleString('id-ID')}`;
                limitWarning.className = "text-xs font-semibold mt-1 text-green-500";
                balanceEl.className = "text-3xl font-bold text-indigo-600";
            }
        } else {
            limitWarning.textContent = "Belum ada batas pengeluaran yang diatur.";
            limitWarning.className = "text-xs font-semibold mt-1 text-gray-400";
            balanceEl.className = "text-3xl font-bold text-indigo-600";
        }
    }

    // Update data Grafik (Chart.js)
    expenseChart.data.datasets[0].data = [
        categoryTotals.Food,
        categoryTotals.Transport,
        categoryTotals.Fun
    ];
    expenseChart.update();

    // Simpan ke LocalStorage browser
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi untuk menambah transaksi baru dari form
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('item-name').value;
    const amount = document.getElementById('item-amount').value;
    const category = document.getElementById('item-category').value;

    if (!name || !amount) {
        alert('Mohon isi semua kolom!');
        return;
    }

    const newTransaction = { name, amount, category };
    transactions.push(newTransaction);

    // Reset form
    document.getElementById('transaction-form').reset();

    // Update aplikasi
    updateApp();
});

// Fungsi untuk menghapus transaksi
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateApp();
}

// Jalankan cek limit otomatis saat angka limit diketik
document.addEventListener('DOMContentLoaded', () => {
    const limitInput = document.getElementById('spending-limit');
    if (limitInput) {
        limitInput.addEventListener('input', updateApp);
    }
});

// Fungsi untuk Dark / Light Mode Toggle
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateTitleColor(isDark);
}

// Fungsi bantu untuk atur warna judul otomatis
function updateTitleColor(isDark) {
    const title = document.getElementById('app-title');
    const subtitle = document.getElementById('app-subtitle');
    if (title && subtitle) {
        if (isDark) {
            title.style.color = '#f3f4f6';
            subtitle.style.color = '#9ca3af';
        } else {
            title.style.color = '#111827';
            subtitle.style.color = '#4b5563';
        }
    }
}

// Cek preferensi mode saat halaman pertama kali dibuka
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    updateTitleColor(true);
} else {
    updateTitleColor(false);
}

// Jalankan saat pertama kali halaman dibuka
updateApp();