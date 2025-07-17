<template>
  <form @submit.prevent="handleSubmit" class="budget-form">
    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" v-model="form.category" required>
        <option value="">Select category</option>
        <option v-for="category in expenseCategories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="limit">Budget Limit</label>
      <input
        id="limit"
        v-model.number="form.limit"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
      />
    </div>

    <div class="form-group">
      <label for="period">Budget Period</label>
      <select id="period" v-model="form.period" required>
        <option value="">Select period</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Update Budget' : 'Create Budget' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import type { Budget } from '../types';
import { dataService } from '../services/DataService';

interface Props {
  budget?: Budget;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [budget: Omit<Budget, 'id' | 'spent'>];
  cancel: [];
}>();

const isEditing = !!props.budget;

const expenseCategories = computed(() => 
  dataService.getCategories().filter(cat => cat !== 'Income')
);

const form = reactive({
  category: '',
  limit: 0,
  period: '' as Budget['period'] | ''
});

// Initialize form with budget data if editing
watch(() => props.budget, (budget) => {
  if (budget) {
    form.category = budget.category;
    form.limit = budget.limit;
    form.period = budget.period;
  }
}, { immediate: true });

const handleSubmit = () => {
  if (form.period === '') return;
  
  emit('submit', {
    category: form.category,
    limit: form.limit,
    period: form.period as Budget['period']
  });
};
</script>

<style scoped>
.budget-form {
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