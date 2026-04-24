<script setup lang="ts">
import { cn } from '@/lib/utils';
const props = defineProps<{ class?: string }>();
</script>

<template>
  <div :class="cn('p-lg', props.class)">
    <slot />
  </div>
</template>
