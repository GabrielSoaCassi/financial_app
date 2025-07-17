<template>
  <div class="accounts">
    <div class="page-header">
      <div>
        <h1>Accounts</h1>
        <p>Manage your financial accounts</p>
      </div>
      <button @click="openAddModal" class="btn-add btn-primary">
        <Plus :size="20" />
        Add Account
      </button>
    </div>

    <div class="accounts-grid">
      <div v-for="account in accounts" :key="account.id" class="account-card" :class="account.type">
        <div class="account-header">
          <div class="account-icon">
            <component :is="getAccountIcon(account.type)" :size="24" />
          </div>
          <div class="account-type">{{ getAccountTypeName(account.type) }}</div>
        </div>

        <div class="account-info">
          <h3 class="account-name">{{ account.name }}</h3>
          <p class="account-balance" :class="{ negative: account.balance < 0 }">
            {{ formatCurrency(account.balance) }}
          </p>
        </div>

        <div class="account-actions">
          <button @click="editAccount(account)" class="btn btn-secondary">
            <Edit :size="16" />
            Edit
          </button>
          <button @click="deleteAccountConfirm(account)" class="btn btn-danger">
            <Trash2 :size="16" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="accounts-summary">
      <div class="summary-card">
        <h2>Account Summary </h2>
        <div class="summary-items">
          <div class="summary-item">
            <span class="summary-label">Total Assets</span>
            <span class="summary-value positive">{{ formatCurrency(totalAssets)
            }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Liabilities</span>
            <span class="summary-value negative">{{
              formatCurrency(Math.abs(totalLiabilities)) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Net Worth</span>
            <span class="summary-value" :class="netWorth >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(netWorth) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Account Modal -->
    <Modal :is-open="showAccountModal" :title="editingAccount ? 'Edit Account' : 'Add New Account'"
      @close="closeAccountModal">
      <AccountForm :account="editingAccount" @submit="handleAccountSubmit" @cancel="closeAccountModal" />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" title="Delete Account" @close="closeDeleteModal">
      <div class="delete-confirmation">
        <p>Are you sure you want to delete <strong>{{ accountToDelete?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone and will also delete all associated transactions.</p>
        <div class="form-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CreditCard, PiggyBank, TrendingUp, Wallet, Plus, Edit, Trash2 } from 'lucide-vue-next';
import { AccountService } from '../services/AccountService';
import Modal  from '../components/Modal.vue';
import AccountForm  from '../components/AccountForm.vue';
import type { Account } from '../types';

const showAccountModal = ref(false);
const showDeleteModal = ref(false);
const editingAccount = ref<Account | undefined>(undefined);
const accountToDelete = ref<Account | undefined>(undefined);

const accounts = ref<Account[]>([])
onMounted(async () => { accounts.value = await AccountService.getAccounts() });
const openAddModal = () => {
  editingAccount.value = undefined;
  showAccountModal.value = true;
};

const totalAssets = computed(() => {
  if (accounts.value)
    return accounts.value
      .filter(account => account.balance > 0)
      .reduce((total, account) => total + account.balance, 0)
  return 0
});

const totalLiabilities = computed(() => {
  if (accounts.value)
    return accounts.value
      .filter(account => account.balance < 0)
      .reduce((total, account) => total + account.balance, 0)
  return 0
});

const netWorth = computed(() => totalAssets.value + totalLiabilities.value);

const editAccount = (account: Account) => {
  editingAccount.value = account;
  showAccountModal.value = true;
};

const closeAccountModal = () => {
  showAccountModal.value = false;
  editingAccount.value = undefined;
};

const handleAccountSubmit = async (accountData: Omit<Account, 'id'>) => {
  if (editingAccount.value) {
    let result = await AccountService.updateAccount(editingAccount.value.id!, accountData);
    if (result != null) {
      accounts.value = accounts.value.map(account => account.id === result.id ? result : account)
    }
  } else {
    let result = await AccountService.addAccount(accountData)
    if (result != null)
      accounts.value.push(result)
  }
  closeAccountModal();
};

const deleteAccountConfirm = (account: Account) => {
  accountToDelete.value = account;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  accountToDelete.value = undefined;
};

const confirmDelete = () => {
  if (accountToDelete.value) {
    AccountService.deleteAccount(accountToDelete.value.id!);
    accounts.value = accounts.value.filter(account => account.id !== accountToDelete.value!.id)
    closeDeleteModal();
  }
};

const getAccountIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    checking: Wallet,
    savings: PiggyBank,
    credit: CreditCard,
    investment: TrendingUp
  };
  return iconMap[type] || Wallet;
};

const getAccountTypeName = (type: string) => {
  const nameMap: { [key: string]: string } = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
    investment: 'Investment Account'
  };
  return nameMap[type] || type;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};
</script>

<style scoped>
.accounts {
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

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.account-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
}

.account-card.checking::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.account-card.savings::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.account-card.credit::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.account-card.investment::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.account-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.account-type {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.account-info {
  margin-bottom: 1.5rem;
}

.account-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.account-balance {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
}

.account-balance:not(.negative) {
  color: #10b981;
}

.account-balance.negative {
  color: #ef4444;
}

.account-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-add {

  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.delete-confirmation {
  text-align: center;
}

.delete-confirmation p {
  margin-bottom: 1rem;
  color: #374151;
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

.accounts-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.summary-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.summary-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-weight: 500;
  color: #64748b;
}

.summary-value {
  font-weight: 700;
  font-size: 1.125rem;
}

.summary-value.positive {
  color: #10b981;
}

.summary-value.negative {
  color: #ef4444;
}

@media (max-width: 768px) {
  .accounts {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .summary-items {
    grid-template-columns: 1fr;
  }
}
</style>