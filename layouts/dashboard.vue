<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import menu from '@/config/menu';

import AppSidebar from '@/components/AppSidebar.vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const route = useRoute();

const breadcrumbs = computed(() => {
  const currentPath = route.path;

  for (const group of menu) {
    if (!group.items) continue;

    for (const item of group.items) {
      
      if (item.url === currentPath) {
        return [
          { title: group.title },
          { title: item.title, url: item.url }
        ];
      }

      if (item.items && item.items.length > 0) {
        for (const subItem of item.items) {
          if (subItem.url === currentPath) {
            return [
              { title: group.title },
              { title: item.title, url: item.url },
              { title: subItem.title, url: subItem.url }
            ];
          }
        }
      }
    }
  }

  return [{ title: '포트폴리오' }, { title: '메인', url: '/dashboard' }];
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar :items="menu" />

    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.title">
                
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbPage v-if="index === breadcrumbs.length - 1">
                    {{ crumb.title }}
                  </BreadcrumbPage>
                  
                  <BreadcrumbLink v-else-if="crumb.url" :href="crumb.url">
                    {{ crumb.title }}
                  </BreadcrumbLink>
                  
                   <span v-else class="flex items-center gap-2">
                    {{ crumb.title }}
                  </span>
                </BreadcrumbItem>

                <BreadcrumbSeparator 
                  v-if="index < breadcrumbs.length - 1" 
                  class="hidden md:block" 
                />
                
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>