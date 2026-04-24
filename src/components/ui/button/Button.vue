<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'glow';
type Size = 'default' | 'sm' | 'lg' | 'icon';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    as?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
  }>(),
  { variant: 'default', size: 'default', as: 'button', type: 'button' }
);

const base =
  'inline-flex items-center justify-center gap-xs whitespace-nowrap rounded-md font-medium transition-all ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 select-none';

const variantClass: Record<Variant, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-accent/30',
  ghost:
    'bg-transparent text-foreground hover:bg-accent/30',
  link:
    'text-primary underline-offset-4 hover:underline bg-transparent',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  glow: 'btn-glow',
};

const sizeClass: Record<Size, string> = {
  default: 'h-11 px-lg text-sm',
  sm: 'h-9 px-md text-sm',
  lg: 'h-12 px-xl text-base',
  icon: 'h-10 w-10 p-0',
};

const classes = computed(() =>
  cn(base, variantClass[props.variant], sizeClass[props.size], props.class)
);
</script>

<template>
  <component
    :is="as"
    :class="classes"
    :type="as === 'button' ? type : undefined"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>
