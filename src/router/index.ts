import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Accounts from '../views/Accounts.vue';
import Transactions from '../views/Transactions.vue';
import Budget from '../views/Budget.vue';
import Goals from '../views/Goals.vue';
import Analytics from '../views/Analytics.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: Accounts
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/budget',
    name: 'Budget',
    component: Budget
  },
  {
    path: '/goals',
    name: 'Goals',
    component: Goals
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;