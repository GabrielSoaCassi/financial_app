<template>
  <form @submit.prevent="handleSubmit" class="account-form">
    <div class="form-group">
      <label for="name">Account Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        placeholder="Enter account name"
      />
    </div>

    <div class="form-group">
      <label for="type">Account Type</label>
      <select id="type" v-model="form.type" required>
        <option value="">Select account type</option>
        <option value="checking">Checking Account</option>
        <option value="savings">Savings Account</option>
        <option value="credit">Credit Card</option>
        <option value="investment">Investment Account</option>
      </select>
    </div>

    <div class="form-group">
      <label for="balance">Initial Balance</label>
      <input
        id="balance"
        v-model.number="form.balance"
        type="number"
        step="0.01"
        required
        placeholder="0.00"
      />
    </div>

    <div class="form-group">
      <label for="currency">Currency</label>
      <select id="currency" v-model="form.currency" required>
        <option value="BRL" selected="true">BRL - Brazilian Real</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Update Account' : 'Create Account' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Account } from '../types';

interface Props {
  account?: Account;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [account: Omit<Account, 'id'>];
  cancel: [];
}>();

const isEditing = !!props.account;

const form = reactive({
  name: '',
  type: '' as Account['type'] | '',
  balance: 0,
  currency: 'BRL'
});

// Initialize form with account data if editing
watch(() => props.account, (account) => {
  if (account) {
    form.name = account.name;
    form.type = account.type;
    form.balance = account.balance;
    form.currency = account.currency;
  }
}, { immediate: true });

const handleSubmit = () => {
  if (form.type === '') return;
  
  emit('submit', {
    name: form.name,
    type: form.type as Account['type'],
    balance: form.balance,
    currency: form.currency
  });
};
</script>

<style scoped>
.account-form {
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