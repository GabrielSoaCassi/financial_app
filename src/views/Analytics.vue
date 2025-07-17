<template>
  <div class="analytics">
    <div class="page-header">
      <h1>Analytics</h1>
      <p>Analyze your financial trends and patterns</p>
    </div>

    <div class="analytics-filters">
      <div class="filter-group">
        <label for="period">Time Period</label>
        <select id="period" v-model="selectedPeriod">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="chart-card">
        <h2>Expense Distribution</h2>
        <div class="chart-container">
          <Doughnut :data="expenseChartData" :options="doughnutOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h2>Income vs Expenses</h2>
        <div class="chart-container">
          <Bar :data="incomeExpenseData" :options="barOptions" />
        </div>
      </div>

      <div class="chart-card wide">
        <h2>Spending Trends</h2>
        <div class="chart-container">
          <Line :data="trendData" :options="lineOptions" />
        </div>
      </div>
    </div>

    <div class="insights-section">
      <div class="insights-card">
        <h2>Financial Insights</h2>
        <div class="insights-grid">
          <div class="insight-item">
            <div class="insight-icon positive">
              <TrendingUp :size="24" />
            </div>
            <div class="insight-content">
              <h3>Spending Decreased</h3>
              <p>Your expenses are 12% lower compared to last month. Great job!</p>
              <span class="insight-value">-$340</span>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon warning">
              <AlertTriangle :size="24" />
            </div>
            <div class="insight-content">
              <h3>High Entertainment Spending</h3>
              <p>Entertainment expenses are 25% above your monthly average.</p>
              <span class="insight-value">+$89</span>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon positive">
              <Target :size="24" />
            </div>
            <div class="insight-content">
              <h3>Savings Goal Progress</h3>
              <p>You're ahead of schedule on your emergency fund goal by 2 months.</p>
              <span class="insight-value">+15%</span>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon info">
              <BarChart3 :size="24" />
            </div>
            <div class="insight-content">
              <h3>Budget Performance</h3>
              <p>You're staying within budget in 3 out of 4 categories this month.</p>
              <span class="insight-value">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analytics-summary">
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Monthly Average Spending</h3>
          <p class="summary-value">{{ formatCurrency(monthlyAverageSpending) }}</p>
          <span class="summary-change positive">-8% from last period</span>
        </div>

        <div class="summary-card">
          <h3>Top Spending Category</h3>
          <p class="summary-value">{{ topSpendingCategory.name }}</p>
          <span class="summary-change">{{ formatCurrency(topSpendingCategory.amount) }} spent</span>
        </div>

        <div class="summary-card">
          <h3>Savings Rate</h3>
          <p class="summary-value">{{ savingsRate }}%</p>
          <span class="summary-change positive">+3% from last month</span>
        </div>

        <div class="summary-card">
          <h3>Budget Utilization</h3>
          <p class="summary-value">{{ budgetUtilization }}%</p>
          <span class="summary-change">{{ budgetStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Doughnut, Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import {
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-vue-next';
import { dataService } from '../services/DataService';
import { AnalyticsService } from '../services/AnalyticsService';
import { BudgetService } from '../services/BudgetService';
import { Budget } from '../types';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const selectedPeriod = ref('30');

const expensesByCategory = ref<{ [key: string]: number }>({})
const monthlyIncome = ref(0)
const monthlyExpenses = ref(0)
const budgets = ref<Budget[]>([])
onMounted(async () => {
  expensesByCategory.value = await AnalyticsService.getExpensesByCategory()
  monthlyIncome.value = await AnalyticsService.getMonthlyIncome()
  monthlyExpenses.value = await AnalyticsService.getMonthlyExpenses()
  budgets.value = await BudgetService.getBudgets()
});


const expenseChartData = computed(() => {
  const categories = Object.keys(expensesByCategory.value);
  const amounts = Object.values(expensesByCategory.value);

  return {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };
});

const incomeExpenseData = computed(() => {
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [monthlyIncome.value, monthlyExpenses.value],
        backgroundColor: ['#10b981', '#ef4444'],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };
});

const trendData = computed(() => {
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [3200, 3200, 3400, 3200, 3200, 3200],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [2800, 3100, 2600, 2900, 2700, 2500],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
        }
      }
    }
  }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `$${context.parsed.y.toFixed(2)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `$${value}`
      }
    }
  }
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `$${value}`
      }
    }
  }
};

const monthlyAverageSpending = computed(() => monthlyExpenses.value);

const topSpendingCategory = computed(() => {
  const categories = expensesByCategory.value;
  const topCategory = Object.entries(categories).reduce((max, [category, amount]) =>
    amount > max.amount ? { name: category, amount } : max,
    { name: '', amount: 0 }
  );
  return topCategory;
});

const savingsRate = computed(() => {
  if (monthlyIncome.value === 0) return 0;
  return Math.round(((monthlyIncome.value - monthlyExpenses.value) / monthlyIncome.value) * 100);
});

const budgetUtilization = computed( () => {
  const totalBudget = budgets.value.reduce((total, budget) => total + budget.limit, 0);
  const totalSpent = budgets.value.reduce((total, budget) => total + budget.spent, 0);

  if (totalBudget === 0) return 0;
  return Math.round((totalSpent / totalBudget) * 100);
});

const budgetStatus = computed( () => {
  const utilization = budgetUtilization.value;
  if (utilization <= 80) return 'On track';
  if (utilization <= 100) return 'Near limit';
  return 'Over budget';
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
</script>

<style scoped>
.analytics {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
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

.analytics-filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 200px;
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

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.chart-card.wide {
  grid-column: 1 / -1;
}

.chart-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

.insights-section {
  margin-bottom: 2rem;
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
  margin: 0 0 1.5rem 0;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.insight-item:hover {
  background: #f1f5f9;
}

.insight-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon.positive {
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

.insight-content {
  flex: 1;
}

.insight-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.insight-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.insight-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.analytics-summary {
  margin-top: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  text-align: center;
}

.summary-card h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.summary-change {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.summary-change.positive {
  color: #10b981;
}

@media (max-width: 1024px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>