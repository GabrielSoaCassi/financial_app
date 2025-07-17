<template>
  <form @submit.prevent="handleSubmit" class="goal-form">
    <div class="form-group">
      <label for="name">Goal Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        placeholder="Enter goal name"
      />
    </div>

    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" v-model="form.category" required>
        <option value="">Select category</option>
        <option value="Savings">Savings</option>
        <option value="Travel">Travel</option>
        <option value="Technology">Technology</option>
        <option value="Home">Home</option>
        <option value="Transportation">Transportation</option>
        <option value="Education">Education</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div class="form-group">
      <label for="targetAmount">Target Amount</label>
      <input
        id="targetAmount"
        v-model.number="form.targetAmount"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
      />
    </div>

    <div class="form-group">
      <label for="currentAmount">Current Amount</label>
      <input
        id="currentAmount"
        v-model.number="form.currentAmount"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
      />
    </div>

    <div class="form-group">
      <label for="deadline">Target Date</label>
      <input
        id="deadline"
        v-model="form.deadline"
        type="date"
        required
      />
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Update Goal' : 'Create Goal' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Goal } from '../types';

interface Props {
  goal?: Goal;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [goal: Omit<Goal, 'id'>];
  cancel: [];
}>();

const isEditing = !!props.goal;

const form = reactive({
  name: '',
  category: '',
  targetAmount: 0,
  currentAmount: 0,
  deadline: ''
});

// Initialize form with goal data if editing
watch(() => props.goal, (goal) => {
  if (goal) {
    form.name = goal.name;
    form.category = goal.category;
    form.targetAmount = goal.targetAmount;
    form.currentAmount = goal.currentAmount;
    form.deadline = goal.deadline;
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('submit', {
    name: form.name,
    category: form.category,
    targetAmount: form.targetAmount,
    currentAmount: form.currentAmount,
    deadline: form.deadline
  });
};
</script>

<style scoped>
.goal-form {
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