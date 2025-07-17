<template>
  <div class="goals">
    <div class="page-header">
      <div>
        <h1>Financial Goals</h1>
        <p>Track your progress towards your financial objectives</p>
      </div>
      <button @click="openAddModal" class="btn btn-primary">
        <Plus :size="20" />
        New Goal
      </button>
    </div>

    <div class="goals-summary">
      <div class="summary-card">
        <h2>Goals Overview</h2>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-label">Total Goals</span>
            <span class="stat-value">{{ goals.length }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Target Amount</span>
            <span class="stat-value">{{ formatCurrency(totalTargetAmount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Current Amount</span>
            <span class="stat-value">{{ formatCurrency(totalCurrentAmount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Progress</span>
            <span class="stat-value">{{ overallProgress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="goals-grid">
      <div v-for="goal in goals" :key="goal.id" class="goal-card" :class="getGoalStatus(goal)">
        <div class="goal-header">
          <div class="goal-info">
            <div class="goal-icon">
              <component :is="getGoalIcon(goal.category)" :size="24" />
            </div>
            <div>
              <h3 class="goal-name">{{ goal.name }}</h3>
              <p class="goal-category">{{ goal.category }}</p>
            </div>
          </div>
          <div class="goal-deadline" :class="getDeadlineStatus(goal.deadline)">
            <CalendarDays :size="16" />
            <span>{{ formatDeadline(goal.deadline) }}</span>
          </div>
        </div>

        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${getProgressPercentage(goal)}%` }"></div>
          </div>
          <div class="progress-info">
            <span class="progress-text">
              {{ formatCurrency(goal.currentAmount) }} of {{ formatCurrency(goal.targetAmount) }}
            </span>
            <span class="progress-percentage">{{ getProgressPercentage(goal) }}%</span>
          </div>
        </div>

        <div class="goal-insights">
          <div class="insight">
            <span class="insight-label">Remaining</span>
            <span class="insight-value">{{ formatCurrency(goal.targetAmount - goal.currentAmount) }}</span>
          </div>
          <div class="insight">
            <span class="insight-label">Monthly Need</span>
            <span class="insight-value">{{ formatCurrency(getMonthlyRequirement(goal)) }}</span>
          </div>
        </div>

        <div class="goal-actions">
          <button @click="editGoal(goal)" class="btn btn-secondary">
            <Edit :size="16" />
            Edit
          </button>
          <button @click="addFunds(goal)" class="btn btn-primary">
            <DollarSign :size="16" />
            Add Funds
          </button>
          <button @click="deleteGoalConfirm(goal)" class="btn btn-danger">
            <Trash2 :size="16" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="goals-chart">
      <div class="chart-card">
        <h2>Goals Progress Timeline</h2>
        <div class="timeline">
          <div v-for="goal in sortedGoalsByDeadline" :key="goal.id" class="timeline-item">
            <div class="timeline-marker" :class="getGoalStatus(goal)"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4>{{ goal.name }}</h4>
                <span class="timeline-date">{{ formatDeadline(goal.deadline) }}</span>
              </div>
              <div class="timeline-progress">
                <div class="timeline-progress-bar">
                  <div class="timeline-progress-fill" :style="{ width: `${getProgressPercentage(goal)}%` }"></div>
                </div>
                <span class="timeline-percentage">{{ getProgressPercentage(goal) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Goal Modal -->
    <Modal :is-open="showGoalModal" :title="editingGoal ? 'Edit Goal' : 'Create New Goal'" @close="closeGoalModal">
      <GoalForm :goal="editingGoal" @submit="handleGoalSubmit" @cancel="closeGoalModal" />
    </Modal>

    <!-- Add Funds Modal -->
    <Modal :is-open="showFundsModal" title="Add Funds to Goal" @close="closeFundsModal">
      <div class="funds-form">
        <div class="goal-info">
          <h3>{{ selectedGoal?.name }}</h3>
          <p>Current: {{ formatCurrency(selectedGoal?.currentAmount || 0) }} / {{
            formatCurrency(selectedGoal?.targetAmount || 0) }}</p>
        </div>
        <form @submit.prevent="handleAddFunds">
          <div class="form-group">
            <label for="amount">Amount to Add</label>
            <input id="amount" v-model.number="fundsAmount" type="number" step="0.01" min="0" required
              placeholder="0.00" />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeFundsModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Funds</button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" title="Delete Goal" @close="closeDeleteModal">
      <div class="delete-confirmation">
        <p>Are you sure you want to delete <strong>{{ goalToDelete?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete Goal</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  PiggyBank,
  Plane,
  Laptop,
  Home,
  Car,
  CalendarDays,
  Plus,
  Edit,
  DollarSign,
  Trash2
} from 'lucide-vue-next';
import Modal from '../components/Modal.vue';
import GoalForm from '../components/GoalForm.vue';
import type { Goal } from '../types';
import { GoalsService } from '../services/GoalsService';

const showGoalModal = ref(false);
const showFundsModal = ref(false);
const showDeleteModal = ref(false);
const editingGoal = ref<Goal | undefined>(undefined);
const selectedGoal = ref<Goal | undefined>(undefined);
const goalToDelete = ref<Goal | undefined>(undefined);
const fundsAmount = ref(0);

const goals = ref<Goal[]>([])
onMounted(async () => goals.value = await GoalsService.getGoals());

const totalTargetAmount = computed(() => {
  return goals.value.reduce((total, goal) => total + goal.targetAmount, 0);
});

const totalCurrentAmount = computed(() => {
  return goals.value.reduce((total, goal) => total + goal.currentAmount, 0);
});

const overallProgress = computed(() => {
  if (totalTargetAmount.value === 0) return 0;
  return Math.round((totalCurrentAmount.value / totalTargetAmount.value) * 100);
});

const sortedGoalsByDeadline = computed(() => {
  return [...goals.value].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
});

const openAddModal = () => {
  editingGoal.value = undefined;
  showGoalModal.value = true;
};

const editGoal = (goal: Goal) => {
  editingGoal.value = goal;
  showGoalModal.value = true;
};

const closeGoalModal = () => {
  showGoalModal.value = false;
  editingGoal.value = undefined;
};

const handleGoalSubmit = async (goalData: Omit<Goal, 'id'>) => {
  if (editingGoal.value) {
    const result = await GoalsService.updateGoal(editingGoal.value.id!, goalData);
    if (result != null) {
      goals.value = goals.value.map(goal => goal.id === result.id ? result : goal);
    }
  } else {
    const result = await GoalsService.addGoal(goalData);
    if (result != null) {
      goals.value.push(result);
    }
  }
  closeGoalModal();
};

const addFunds = (goal: Goal) => {
  selectedGoal.value = goal;
  fundsAmount.value = 0;
  showFundsModal.value = true;
};

const closeFundsModal = () => {
  showFundsModal.value = false;
  selectedGoal.value = undefined;
  fundsAmount.value = 0;
};

const handleAddFunds = async () => {
  if (selectedGoal.value && fundsAmount.value > 0) {
    const newAmount = selectedGoal.value.currentAmount + fundsAmount.value;
    ;
    let result = await GoalsService.updateGoal(selectedGoal.value.id!, { ...selectedGoal.value,currentAmount: newAmount });
    if (result != null) {
      goals.value = goals.value.map(goal => goal.id === result.id ? result : goal);
    }
    closeFundsModal();
  }
};

const deleteGoalConfirm = (goal: Goal) => {
  goalToDelete.value = goal;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  goalToDelete.value = undefined;
};

const confirmDelete = () => {
  if (goalToDelete.value) {
    GoalsService.deleteGoal(goalToDelete.value.id!);
    goals.value = goals.value.filter(goal => goal.id !== goalToDelete.value!.id)
    closeDeleteModal();
  }
};

const getGoalIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Savings': PiggyBank,
    'Travel': Plane,
    'Technology': Laptop,
    'Home': Home,
    'Transportation': Car
  };
  return iconMap[category] || PiggyBank;
};

const getProgressPercentage = (goal: any) => {
  return Math.round((goal.currentAmount / goal.targetAmount) * 100);
};

const getGoalStatus = (goal: any) => {
  const progress = getProgressPercentage(goal);
  if (progress >= 100) return 'completed';
  if (progress >= 75) return 'on-track';
  if (progress >= 50) return 'progressing';
  return 'behind';
};

const getDeadlineStatus = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 30) return 'urgent';
  if (daysUntilDeadline < 90) return 'approaching';
  return 'distant';
};

const getMonthlyRequirement = (goal: any) => {
  const remaining = goal.targetAmount - goal.currentAmount;
  const deadlineDate = new Date(goal.deadline);
  const today = new Date();
  const monthsUntilDeadline = Math.max(1, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return remaining / monthsUntilDeadline;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.goals {
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

.goals-summary {
  margin-bottom: 2rem;
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

.summary-stats {
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

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.goal-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.goal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.goal-card.completed::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.goal-card.on-track::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.goal-card.progressing::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.goal-card.behind::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.goal-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.goal-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.goal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.goal-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.goal-category {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.goal-deadline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.goal-deadline.urgent {
  color: #ef4444;
  background: #fee2e2;
}

.goal-deadline.approaching {
  color: #f59e0b;
  background: #fef3c7;
}

.goal-deadline.distant {
  color: #10b981;
  background: #dcfce7;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.progress-text {
  color: #64748b;
}

.progress-percentage {
  font-weight: 600;
  color: #0f172a;
}

.goal-insights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.insight {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.insight-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.insight-value {
  font-weight: 600;
  color: #0f172a;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
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

.funds-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-info {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.goal-info h3 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
}

.goal-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
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

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
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

.goals-chart {
  margin-top: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.chart-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timeline-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-marker.completed {
  background: #10b981;
}

.timeline-marker.on-track {
  background: #3b82f6;
}

.timeline-marker.progressing {
  background: #f59e0b;
}

.timeline-marker.behind {
  background: #ef4444;
}

.timeline-content {
  flex: 1;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.timeline-date {
  font-size: 0.875rem;
  color: #64748b;
}

.timeline-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timeline-progress-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.timeline-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.timeline-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 40px;
}

@media (max-width: 768px) {
  .goals {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .goals-grid {
    grid-template-columns: 1fr;
  }

  .goal-insights {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-content {
    width: 100%;
  }
}
</style>