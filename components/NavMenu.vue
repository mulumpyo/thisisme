<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ChevronRight, LayoutDashboard } from "lucide-vue-next";
import * as LucideIcons from "lucide-vue-next";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

defineProps<{
  items: {
    title: string
    items?: {
      title: string
      icon: string
      url?: string
      isActive?: boolean
      items?: {
        title: string
        icon: string
        url: string
      }[]
    }[]
  }[]
}>();

const route = useRoute();

const getIcon = (iconName: string) => {
  if (iconName && iconName in LucideIcons) {
    return (LucideIcons as any)[iconName];
  }
  return LayoutDashboard;
};

const checkIsActive = (url?: string) => {
  if (!url) return false;
  return route.path === url;
};
</script>

<template>
  <SidebarGroup v-for="group in items" :key="group.title">
    <SidebarGroupLabel>{{ group.title }}</SidebarGroupLabel>
    <SidebarMenu>
      
      <template v-for="menuItem in group.items" :key="menuItem.title">
        
        <Collapsible
          v-if="menuItem.items && menuItem.items.length > 0"
          as-child
          :default-open="menuItem.isActive" 
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="menuItem.title" :isActive="checkIsActive(menuItem.url)">
                <component :is="getIcon(menuItem.icon)" />
                <span>{{ menuItem.title }}</span>
                <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in menuItem.items" :key="subItem.title">
                  <SidebarMenuSubButton as-child :isActive="checkIsActive(subItem.url)">
                    <NuxtLink :to="subItem.url">
                       <component :is="getIcon(subItem.icon)" />
                      <span>{{ subItem.title }}</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton as-child :tooltip="menuItem.title" :isActive="checkIsActive(menuItem.url)">
            <NuxtLink :to="menuItem.url">
               <component :is="getIcon(menuItem.icon)" />
              <span>{{ menuItem.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </template>
      
    </SidebarMenu>
  </SidebarGroup>
</template>