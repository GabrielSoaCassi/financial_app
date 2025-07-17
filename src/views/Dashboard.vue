<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's your financial overview</p>
    </div>

    <div class="stats-grid">
      <StatCard
        title="Total Balance"
        :value="totalBalance"
        :icon="Wallet"
        :change="12.5"
        variant="success"
      />
      <StatCard
        title="Monthly Income"
        :value="monthlyIncome"
        :icon="TrendingUp"
        :change="8.2"
        variant="success"
      />
      <StatCard
        title="Monthly Expenses"
        :value="monthlyExpenses"
        :icon="TrendingDown"
        :change="-3.1"
        variant="warning"
      />
      <StatCard
        title="Net Worth"
        :value="totalBalance"
        :icon="PiggyBank"
        :change="15.7"
        variant="success"
      />
    </div>

    <div class="dashboard-content">
      <div class="chart-section">
        <div class="card">
          <div class="card-header">
            <h2>Spending Overview</h2>
            <p>Monthly expense breakdown by category</p>
          </div>
          <div class="chart-container">
            <Doughnut :data="expenseChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="recent-section">
        <div class="card">
          <div class="card-header">
            <h2>Recent Transactions</h2>
            <router-link to="/transactions" class="view-all">View All</router-link>
          </div>
          <div class="transactions-list">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id"
              class="transaction-item"
            >
              <div class="transaction-icon" :class="transaction.type">
                <component :is="getTransactionIcon(transaction.category)" :size="20" />
              </div>
              <div class="transaction-details">
                <div class="transaction-description">{{ transaction.description }}</div>
                <div class="transaction-category">{{ transaction.category }}</div>
              </div>
              <div class="transaction-amount" :class="transaction.type">
                {{ formatCurrency(transaction.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Film,
  DollarSign
} from 'lucide-vue-next';
import StatCard from '../components/StatCard.vue';
import { AnalyticsService } from '../services/AnalyticsService';
import { Transaction } from '../types';
import { TransactionService } from '../services/TransactionService';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const totalBalance = ref(0) 
const monthlyIncome = ref(0) 
const monthlyExpenses = ref(0) 
const recentTransactions = ref<Transaction[]>([]) 
const expensesByCategory = ref<{ [key: string]: number}>({})


onMounted(async () => {
  totalBalance.value = await AnalyticsService.getTotalBalance()
  monthlyIncome.value = await AnalyticsService.getMonthlyIncome()
  monthlyExpenses.value = await AnalyticsService.getMonthlyExpenses()
  expensesByCategory.value = await AnalyticsService.getExpensesByCategory()
  recentTransactions.value = (await TransactionService.getTransactions()).slice(0,5)
})
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
        hoverOffset: 4
      }
    ]
  };
});

const chartOptions = {
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
          return `${context.label}: $${value.toFixed(2)}`;
        }
      }
    }
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.dashboard-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.125rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.card-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.card-header p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.view-all {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.view-all:hover {
  color: #1d4ed8;
}

.chart-container {
  height: 300px;
  position: relative;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.transaction-item:hover {
  background-color: #f8fafc;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon.income {
  background: #dcfce7;
  color: #10b981;
}

.transaction-icon.expense {
  background: #fee2e2;
  color: #ef4444;
}

.transaction-details {
  flex: 1;
}

.transaction-description {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.transaction-category {
  font-size: 0.875rem;
  color: #64748b;
}

.transaction-amount {
  font-weight: 600;
  font-size: 1.125rem;
}

.transaction-amount.income {
  color: #10b981;
}

.transaction-amount.expense {
  color: #ef4444;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>