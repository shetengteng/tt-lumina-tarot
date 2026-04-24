<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    class?: string;
  }>(),
  { orientation: 'horizontal', decorative: true }
);

const classes = computed(() =>
  cn(
    'shrink-0 bg-border',
    props.orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
    props.class
  )
);
</script>

<template>
  <div
    :class="classes"
    :role="props.decorative ? 'none' : 'separator'"
    :aria-orientation="props.decorative ? undefined : props.orientation"
  />
</template>
