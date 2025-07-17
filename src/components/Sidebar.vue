<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">FinanceFlow</h1>
    </div>
    
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.name"
        :to="item.path" 
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowUpDown, 
  PiggyBank, 
  Target, 
  BarChart3 
} from 'lucide-vue-next';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: CreditCard },
  { name: 'Transactions', path: '/transactions', icon: ArrowUpDown },
  { name: 'Budget', path: '/budget', icon: PiggyBank },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 }
];
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #334155;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #1e293b;
  color: white;
  border-left-color: #3b82f6;
}

.nav-item.active {
  background-color: #1e293b;
  color: white;
  border-left-color: #3b82f6;
}

.nav-item span {
  font-weight: 500;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 0;
  }
  
  .nav-item {
    flex-direction: column;
    min-width: 80px;
    padding: 1rem 0.5rem;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .nav-item:hover,
  .nav-item.active {
    border-left: none;
    border-bottom-color: #3b82f6;
  }
  
  .nav-item span {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
}
</style>