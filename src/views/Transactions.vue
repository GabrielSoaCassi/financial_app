<template>
  <div class="transactions">
    <div class="page-header">
      <div>
        <h1>Transactions</h1>
        <p>Track your income and expenses</p>
      </div>
      <button @click="openAddModal" class="btn btn-primary">
        <Plus :size="20" />
        Add Transaction
      </button>
    </div>

    <div class="transactions-filters">
      <div class="filter-group">
        <label for="category">Category</label>
        <select id="category" v-model="selectedCategory">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="type">Type</label>
        <select id="type" v-model="selectedType">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="account">Account</label>
        <select id="account" v-model="selectedAccount">
          <option value="">All Accounts</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="transactions-list">
      <div class="list-header">
        <h2>Recent Transactions</h2>
        <div class="list-summary">
          <span class="total-income">Income: {{ formatCurrency(totalIncome) }}</span>
          <span class="total-expenses">Expenses: {{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>

      <div class="transactions-table">
        <div class="table-header">
          <div class="header-cell">Date</div>
          <div class="header-cell">Description</div>
          <div class="header-cell">Category</div>
          <div class="header-cell">Account</div>
          <div class="header-cell">Amount</div>
        </div>

        <div class="table-body">
          <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-row">
            <div class="cell date-cell">
              {{ formatDate(transaction.date) }}
            </div>
            <div class="cell description-cell">
              <div class="transaction-icon" :class="transaction.type">
                <component :is="getTransactionIcon(transaction.category)" :size="20" />
              </div>
              <span>{{ transaction.description }}</span>
            </div>
            <div class="cell category-cell">
              <span class="category-badge">{{ transaction.category }}</span>
            </div>
            <div class="cell account-cell">
              {{ getAccountName(transaction.accountId) }}
            </div>
            <div class="cell amount-cell" :class="transaction.type">
              <div class="amount-actions">
                <span>{{ formatCurrency(transaction.amount) }}</span>
                <div class="action-buttons">
                  <button @click="editTransaction(transaction)" class="action-btn">
                    <Edit :size="16" />
                  </button>
                  <button @click="deleteTransactionConfirm(transaction)" class="action-btn delete">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <Modal :is-open="showTransactionModal" :title="editingTransaction ? 'Edit Transaction' : 'Add New Transaction'"
      @close="closeTransactionModal">
      <TransactionForm :transaction="editingTransaction" @submit="handleTransactionSubmit"
        @cancel="closeTransactionModal" />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" title="Delete Transaction" @close="closeDeleteModal">
      <div class="delete-confirmation">
        <p>Are you sure you want to delete this transaction?</p>
        <div class="transaction-preview">
          <strong>{{ transactionToDelete?.description }}</strong><br>
          <span>{{ formatCurrency(transactionToDelete?.amount || 0) }}</span>
        </div>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete Transaction</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Utensils,
  Car,
  Home,
  ShoppingCart,
  Film,
  DollarSign,
  Plus,
  Edit,
  Trash2
} from 'lucide-vue-next';
import Modal from '../components/Modal.vue';
import TransactionForm from '../components/TransactionForm.vue';
import type { Account, Transaction } from '../types';
import { AccountService } from '../services/AccountService';
import { TransactionService } from '../services/TransactionService';

const selectedCategory = ref('');
const selectedType = ref('');
const selectedAccount = ref('');

const showTransactionModal = ref(false);
const showDeleteModal = ref(false);
const editingTransaction = ref<Transaction | undefined>(undefined);
const transactionToDelete = ref<Transaction | undefined>(undefined);
const accounts = ref<Account[]>([])

const transactions = ref<Transaction[]>([])
onMounted(async () => {
  accounts.value = await AccountService.getAccounts()
  transactions.value = await TransactionService.getTransactions()
});

const categories = computed(() => {
  const allCategories = transactions.value.map(t => t.category);
  return [...new Set(allCategories)].sort();
});

const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const categoryMatch = !selectedCategory.value || transaction.category === selectedCategory.value;
    const typeMatch = !selectedType.value || transaction.type === selectedType.value;
    const accountMatch = !selectedAccount.value || transaction.accountId === selectedAccount.value;

    return categoryMatch && typeMatch && accountMatch;
  });
});

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((total, t) => total + t.amount, 0);
});

const totalExpenses = computed(() => {
  return Math.abs(filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((total, t) => total + t.amount, 0));
});

const openAddModal = () => {
  editingTransaction.value = undefined;
  showTransactionModal.value = true;
};

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction;
  showTransactionModal.value = true;
};

const closeTransactionModal = () => {
  showTransactionModal.value = false;
  editingTransaction.value = undefined;
};

const handleTransactionSubmit = async (transactionData: Omit<Transaction, 'id'>) => {
  if (editingTransaction.value) {
    const result = await TransactionService.updateTransaction(editingTransaction.value.id!, transactionData);
    if (result != null) {
      transactions.value = transactions.value.map(
        transaction => transaction.id === result.id ? result : transaction
      );
    }
  } else {
    const result = await TransactionService.addTransaction(transactionData);
    if (result != null) {
      transactions.value.push(result);
    }
  }
  closeTransactionModal();
};


const deleteTransactionConfirm = (transaction: Transaction) => {
  transactionToDelete.value = transaction;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  transactionToDelete.value = undefined;
};

const confirmDelete = () => {
  if (transactionToDelete.value) {
    TransactionService.deleteTransaction(transactionToDelete.value.id!);
    transactions.value = transactions.value.filter(transaction => transaction.id !== transactionToDelete.value!.id)
    closeDeleteModal();
  }
};

const getTransactionIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Food & Dining': Utensils,
    'Transportation': Car,
    'Housing': Home,
    'Shopping': ShoppingCart,
    'Entertainment': Film,
    'Income': DollarSign
  };
  return iconMap[category] || DollarSign;
};

const getAccountName = (accountId: string) => {
  const account = accounts.value.find(a => a.id === accountId);
  return account?.name || 'Unknown Account';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: "BRL"
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.transactions {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.125rem;
}

.transactions-filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.transactions-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.list-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.list-summary {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.total-income {
  color: #10b981;
}

.total-expenses {
  color: #ef4444;
}

.transactions-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 120px 1fr 140px 140px 120px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.header-cell {
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.transaction-row {
  display: grid;
  grid-template-columns: 120px 1fr 140px 140px 120px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: #f8fafc;
}

.cell {
  padding: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.date-cell {
  color: #64748b;
  font-weight: 500;
}

.description-cell {
  gap: 0.75rem;
  font-weight: 500;
  color: #0f172a;
}

.transaction-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction-icon.income {
  background: #dcfce7;
  color: #10b981;
}

.transaction-icon.expense {
  background: #fee2e2;
  color: #ef4444;
}

.category-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.account-cell {
  color: #64748b;
}

.amount-cell {
  font-weight: 600;
}

.amount-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.transaction-row:hover .action-buttons {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.amount-cell.income {
  color: #10b981;
}

.amount-cell.expense {
  color: #ef4444;
}

.delete-confirmation {
  text-align: center;
}

.delete-confirmation p {
  margin-bottom: 1rem;
  color: #374151;
}

.transaction-preview {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.warning-text {
  color: #ef4444;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .transactions {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .transactions-filters {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .table-header,
  .transaction-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .cell {
    padding: 0.5rem 1rem;
    justify-content: space-between;
  }

  .cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    margin-right: 1rem;
  }
}
</style>