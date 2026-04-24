<script setup lang="ts">
import { computed } from 'vue';
import { SwitchRoot, SwitchThumb, type SwitchRootEmits, type SwitchRootProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<SwitchRootProps & { class?: string }>();
const emit = defineEmits<SwitchRootEmits>();

const rootClass = computed(() =>
  cn(
    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
    props.class
  )
);
</script>

<template>
  <SwitchRoot
    v-bind="$attrs"
    :checked="props.checked"
    :default-checked="props.defaultChecked"
    :disabled="props.disabled"
    :required="props.required"
    :name="props.name"
    :value="props.value"
    :class="rootClass"
    @update:checked="emit('update:checked', $event)"
  >
    <SwitchThumb
      class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    />
  </SwitchRoot>
</template>
