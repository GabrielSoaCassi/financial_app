<template>
  <form @submit.prevent="handleSubmit" class="transaction-form">
    <div class="form-group">
      <label for="type">Transaction Type</label>
      <select id="type" v-model="form.type" required @change="updateAmount">
        <option value="">Select type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <input
        id="description"
        v-model="form.description"
        type="text"
        required
        placeholder="Enter transaction description"
      />
    </div>

    <div class="form-group">
      <label for="amount">Amount</label>
      <input
        id="amount"
        v-model.number="form.displayAmount"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
        @input="updateAmount"
      />
    </div>

    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" v-model="form.category" required>
        <option value="">Select category</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="account">Account</label>
      <select id="account" v-model="form.accountId" required>
        <option value="">Select account</option>
        <option v-for="account in accounts" :key="account.id" :value="account.id">
          {{ account.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="date">Date</label>
      <input
        id="date"
        v-model="form.date"
        type="date"
        required
      />
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Update Transaction' : 'Add Transaction' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted, ref } from 'vue';
import type { Transaction, Account } from '../types';
import { dataService } from '../services/DataService';
import { AccountService } from '../services/AccountService';

interface Props {
  transaction?: Transaction;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [transaction: Omit<Transaction, 'id'>];
  cancel: [];
}>();
const accounts = ref<Account[]>([])
onMounted(async () => accounts.value =  await AccountService.getAccounts())
const isEditing = !!props.transaction;
const categories = computed(() => dataService.getCategories());

const form = reactive({
  type: '' as Transaction['type'] | '',
  description: '',
  displayAmount: 0,
  amount: 0,
  category: '',
  accountId: '',
  date: new Date().toISOString().split('T')[0]
});

// Initialize form with transaction data if editing
watch(() => props.transaction, (transaction) => {
  if (transaction) {
    form.type = transaction.type;
    form.description = transaction.description;
    form.displayAmount = Math.abs(transaction.amount);
    form.amount = transaction.amount;
    form.category = transaction.category;
    form.accountId = transaction.accountId;
    form.date = transaction.date;
  }
}, { immediate: true });

const updateAmount = () => {
  if (form.type === 'expense') {
    form.amount = -Math.abs(form.displayAmount);
  } else if (form.type === 'income') {
    form.amount = Math.abs(form.displayAmount);
  }
};

const handleSubmit = () => {
  if (form.type === '') return;
  
  updateAmount();
  
  emit('submit', {
    type: form.type as Transaction['type'],
    description: form.description,
    amount: form.amount,
    category: form.category,
    accountId: form.accountId,
    date: form.date
  });
};
</script>

<style scoped>
.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
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
</style>