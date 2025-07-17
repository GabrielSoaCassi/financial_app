<template>
  <div class="budget">
    <div class="page-header">
      <div>
        <h1>Budget</h1>
        <p>Monitor your spending against your budget goals</p>
      </div>
      <button @click="openAddModal" class="btn-add btn-primary">
        <Plus :size="20" />
        Create Budget
      </button>
    </div>

    <div class="budget-overview">
      <div class="overview-card">
        <h2>Monthly Budget Overview</h2>
        <div class="overview-stats">
          <div class="stat">
            <span class="stat-label">Total Budget</span>
            <span class="stat-value">{{ formatCurrency(totalBudget) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Spent</span>
            <span class="stat-value">{{ formatCurrency(totalSpent) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Remaining</span>
            <span class="stat-value" :class="remaining >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(remaining) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="budget-categories">
      <div v-for="budget in budgets" :key="budget.id" class="budget-card">
        <div class="budget-header">
          <div class="category-info">
            <div class="category-icon">
              <component :is="getCategoryIcon(budget.category)" :size="20" />
            </div>
            <div>
              <h3 class="category-name">{{ budget.category }}</h3>
              <p class="budget-period">{{ budget.period }}</p>
            </div>
          </div>
          <div class="budget-amounts">
            <span class="spent-amount">{{ formatCurrency(budget.spent) }}</span>
            <span class="budget-limit">of {{ formatCurrency(budget.limit) }}</span>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :class="getProgressClass(budget)"
              :style="{ width: `${Math.min(getProgressPercentage(budget), 100)}%` }"></div>
          </div>
          <div class="progress-info">
            <span class="progress-percentage">{{ getProgressPercentage(budget) }}%</span>
            <span class="remaining-amount" :class="budget.limit - budget.spent >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(budget.limit - budget.spent) }} remaining
            </span>
          </div>
        </div>

        <div class="budget-actions">
          <button @click="editBudget(budget)" class="btn btn-secondary">
            <Edit :size="16" />
            Edit
          </button>
          <button @click="deleteBudgetConfirm(budget)" class="btn btn-danger">
            <Trash2 :size="16" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="budget-insights">
      <div class="insights-card">
        <h2>Budget Insights</h2>
        <div class="insights-list">
          <div v-for="insight in budgetInsights" :key="insight.id" class="insight-item">
            <div class="insight-icon" :class="insight.type">
              <component :is="insight.icon" :size="20" />
            </div>
            <div class="insight-content">
              <h4>{{ insight.title }}</h4>
              <p>{{ insight.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Budget Modal -->
    <Modal :is-open="showBudgetModal" :title="editingBudget ? 'Edit Budget' : 'Create New Budget'"
      @close="closeBudgetModal">
      <BudgetForm :budget="editingBudget" @submit="handleBudgetSubmit" @cancel="closeBudgetModal" />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" title="Delete Budget" @close="closeDeleteModal">
      <div class="delete-confirmation">
        <p>Are you sure you want to delete the budget for <strong>{{ budgetToDelete?.category }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete Budget</button>
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
  ShoppingCart,
  Film,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-vue-next';
import { BudgetService } from '../services/BudgetService';
import Modal from '../components/Modal.vue';
import BudgetForm from '../components/BudgetForm.vue';
import type { Budget } from '../types';

const showBudgetModal = ref(false);
const showDeleteModal = ref(false);
const editingBudget = ref<Budget | undefined>(undefined);
const budgetToDelete = ref<Budget | undefined>(undefined);

const budgets = ref<Budget[]>([])
onMounted(async () => budgets.value = await BudgetService.getBudgets());
const totalBudget = computed(() => {
  if (budgets.value)
    return budgets.value.reduce((total, budget) => total + budget.limit, 0);
  return 0
});

const totalSpent = computed(() => {
  if (budgets.value)
    return budgets.value.reduce((total, budget) => total + budget.spent, 0);
  return 0
});

const remaining = computed(() => totalBudget.value - totalSpent.value);

const budgetInsights = computed(() => {
  const insights = [];
  const overBudgetCategories = budgets.value.filter(b => b.spent > b.limit);
  const nearLimitCategories = budgets.value.filter(b =>
    b.spent / b.limit >= 0.8 && b.spent <= b.limit
  );
  const onTrackCategories = budgets.value.filter(b => b.spent / b.limit < 0.8);

  if (overBudgetCategories.length > 0) {
    insights.push({
      id: 'over-budget',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Over Budget Alert',
      description: `You're over budget in ${overBudgetCategories.length} categories. Consider reviewing your spending.`
    });
  }

  if (nearLimitCategories.length > 0) {
    insights.push({
      id: 'near-limit',
      type: 'info',
      icon: TrendingUp,
      title: 'Approaching Limits',
      description: `${nearLimitCategories.length} categories are near their budget limits this month.`
    });
  }

  if (onTrackCategories.length > 0) {
    insights.push({
      id: 'on-track',
      type: 'success',
      icon: CheckCircle,
      title: 'Good Progress',
      description: `You're on track with ${onTrackCategories.length} budget categories. Keep it up!`
    });
  }

  return insights;
});

const openAddModal = () => {
  editingBudget.value = undefined;
  showBudgetModal.value = true;
};

const editBudget = (budget: Budget) => {
  editingBudget.value = budget;
  showBudgetModal.value = true;
};

const closeBudgetModal = () => {
  showBudgetModal.value = false;
  editingBudget.value = undefined;
};

const handleBudgetSubmit = async (budgetData: Omit<Budget, 'id' | 'spent'>) => {
  if (editingBudget.value) {
    let result = await BudgetService.updateBudget(editingBudget.value.id!, budgetData);
    if (result != null) {
      budgets.value = budgets.value.map(budget => budget.id === result.id ? result : budget)
    }
  } else {
    let result = await BudgetService.addBudget(budgetData);
    if (result != null) {
      budgets.value.push(result)
    }
  }
  closeBudgetModal();
};

const deleteBudgetConfirm = (budget: Budget) => {
  budgetToDelete.value = budget;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  budgetToDelete.value = undefined;
};

const confirmDelete = () => {
  if (budgetToDelete.value) {
    BudgetService.deleteBudget(budgetToDelete.value.id!);
    budgets.value = budgets.value.filter(budget => budget.id !== budgetToDelete.value!.id)
    closeDeleteModal();
  }
};

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Food & Dining': Utensils,
    'Transportation': Car,
    'Shopping': ShoppingCart,
    'Entertainment': Film
  };
  return iconMap[category] || ShoppingCart;
};

const getProgressPercentage = (budget: any) => {
  return Math.round((budget.spent / budget.limit) * 100);
};

const getProgressClass = (budget: any) => {
  const percentage = getProgressPercentage(budget);
  if (percentage >= 100) return 'over-budget';
  if (percentage >= 80) return 'near-limit';
  return 'on-track';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

</script>

<style scoped>
.budget {
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

.budget-overview {
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.overview-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.budget-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.budget-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.budget-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.budget-period {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  text-transform: capitalize;
}

.budget-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.spent-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.budget-limit {
  font-size: 0.875rem;
  color: #64748b;
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.on-track {
  background: #10b981;
}

.progress-fill.near-limit {
  background: #f59e0b;
}

.progress-fill.over-budget {
  background: #ef4444;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.progress-percentage {
  font-weight: 600;
  color: #0f172a;
}

.remaining-amount.positive {
  color: #10b981;
}

.remaining-amount.negative {
  color: #ef4444;
}

.budget-actions {
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

.budget-insights {
  margin-top: 2rem;
}

.insights-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.insights-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon.success {
  background: #dcfce7;
  color: #10b981;
}

.insight-icon.warning {
  background: #fef3c7;
  color: #f59e0b;
}

.insight-icon.info {
  background: #dbeafe;
  color: #3b82f6;
}

.insight-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.insight-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

@media (max-width: 768px) {
  .budget {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .overview-stats {
    grid-template-columns: 1fr;
  }

  .budget-categories {
    grid-template-columns: 1fr;
  }
}
</style>