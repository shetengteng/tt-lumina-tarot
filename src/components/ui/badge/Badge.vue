<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'destructive';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    class?: string;
  }>(),
  { variant: 'default' }
);

const base =
  'inline-flex items-center rounded-md border px-xs py-0.5 text-xs font-medium transition-colors';

const variantClass: Record<Variant, string> = {
  default: 'border-transparent bg-primary/20 text-primary',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border text-foreground',
  destructive: 'border-transparent bg-destructive/20 text-destructive',
};

const classes = computed(() => cn(base, variantClass[props.variant], props.class));
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
