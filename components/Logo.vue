<script setup lang="ts">
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const emit = defineEmits(['navigate-to-user-profile']);
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        class="cursor-pointer"
        @click="emit('navigate-to-user-profile')"
      >
        <div
          class="flex aspect-square w-8 h-8 items-center justify-center rounded-lg
                 bg-[#0a0a0a] text-[#fafafa] 
                 dark:bg-[#ffffff] dark:text-[#0a0a0a]"
        >
          <span class="font-bold text-2xl">t</span>
        </div>

        <div class="flex-1 text-left text-lg leading-tight">
          <span class="truncate font-bold">thisisme</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
