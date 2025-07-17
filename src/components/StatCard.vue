<template>
  <div class="stat-card" :class="variant">
    <div class="stat-header">
      <div class="stat-info">
        <h3 class="stat-title">{{ title }}</h3>
        <p class="stat-value">{{ formattedValue }}</p>
      </div>
      <div class="stat-icon">
        <component :is="icon" :size="24" />
      </div>
    </div>
    <div v-if="change" class="stat-change" :class="changeClass">
      <component :is="changeIcon" :size="16" />
      <span>{{ Math.abs(change) }}% from last month</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

interface Props {
  title: string;
  value: number;
  icon: any;
  change?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  format?: 'currency' | 'number' | 'percentage';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  format: 'currency'
});

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(props.value);
    case 'percentage':
      return `${props.value}%`;
    default:
      return props.value.toLocaleString();
  }
});

const changeClass = computed(() => {
  if (!props.change) return '';
  return props.change > 0 ? 'positive' : 'negative';
});

const changeIcon = computed(() => {
  if (!props.change) return null;
  return props.change > 0 ? TrendingUp : TrendingDown;
});
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-card.success .stat-icon {
  background: #dcfce7;
  color: #10b981;
}

.stat-card.warning .stat-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-card.danger .stat-icon {
  background: #fee2e2;
  color: #ef4444;
}
</style>