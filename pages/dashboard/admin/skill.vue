<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '@/components/admin/skill/CategoryManager.vue';
import SkillManager from '@/components/admin/skill/SkillManager.vue';

definePageMeta({ 
  middleware: ['auth', 'admin'], 
  layout: 'dashboard' 
});

useHead({ title: `기술 스택 관리 | thisisme` });
</script>

<template>
  <div class="w-full p-4 md:p-8">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold">기술 스택 관리</h1>
        <p class="text-muted-foreground text-sm mt-1">
          기술 스택과 카테고리를 관리합니다.
        </p>
      </div>
    </div>

    <Tabs default-value="skills" class="w-full">
      <TabsList class="grid w-full md:w-auto grid-cols-2 mb-4">
        <TabsTrigger value="skills">기술 스택</TabsTrigger>
        <TabsTrigger value="categories">카테고리</TabsTrigger>
      </TabsList>

      <TabsContent value="skills">
        <SkillManager />
      </TabsContent>

      <TabsContent value="categories">
        <CategoryManager />
      </TabsContent>
    </Tabs>
  </div>
</template>