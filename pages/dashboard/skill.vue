<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, X, Check, Loader2, Database, Code2, Wrench } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

useHead({
  title: '기술 스택 | thisisme',
  meta: [{ name: 'description', content: '나만의 기술 스택을 설정하세요.' }]
});

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
});

interface Skill {
  skill_id: string;
  category_id: string;
  name: string;
}

interface Category {
  category_id: string;
  name: string;
}

interface UserSkill {
  skill_id: string;
  order_index: number;
}

// State
const searchQuery = ref('');
const isUpdating = ref(false);

const { data: categories } = await useFetch<Category[]>('/api/skill-categories');
const { data: allSkills } = await useFetch<Skill[]>('/api/skill');
const { data: userSkillsData, refresh: refreshUserSkills } = await useFetch<UserSkill[]>('/api/user-skills');

const userSkillIds = computed(() => {
  const ids = new Set<string>();
  userSkillsData.value?.forEach(us => ids.add(us.skill_id));
  return ids;
});

const groupedSkills = computed(() => {
  if (!categories.value || !allSkills.value) return [];

  const query = searchQuery.value.toLowerCase().trim();
  
  return categories.value.map(cat => {
    const skills = allSkills.value!.filter(s => 
      s.category_id === cat.category_id && 
      s.name.toLowerCase().includes(query)
    );
    return {
      ...cat,
      skills
    };
  }).filter(group => group.skills.length > 0);
});

const selectedSkillsList = computed(() => {
  if (!userSkillsData.value || !allSkills.value) return [];
  const sortedUserSkills = [...userSkillsData.value].sort((a, b) => a.order_index - b.order_index);
  
  return sortedUserSkills.map(us => 
    allSkills.value?.find(s => s.skill_id === us.skill_id)
  ).filter(Boolean) as Skill[];
});

const toggleSkill = async (skill: Skill) => {
  if (isUpdating.value) return;
  const isSelected = userSkillIds.value.has(skill.skill_id);
  
  try {
    isUpdating.value = true;
    
    if (isSelected) {
      await $fetch(`/api/user-skills/${skill.skill_id}`, { method: 'DELETE' });
    } else {
      await $fetch('/api/user-skills', { 
        method: 'POST',
        body: { skill_id: skill.skill_id }
      });
    }
    
    await refreshUserSkills();
    
    if (!isSelected) {
      toast.success(`${skill.name} 추가됨`);
    }
  } catch (error) {
    console.error(error);
    toast.error('변경 사항을 저장하지 못했습니다.');
  } finally {
    isUpdating.value = false;
  }
};

const getCategoryIcon = (catName: string) => {
  if (catName.includes('Backend') || catName.includes('DB')) return Database;
  if (catName.includes('Frontend')) return Code2;
  return Wrench;
};
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-0 h-[calc(100vh-4rem)]">
    
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight">기술 스택 설정</h1>
      <p class="text-muted-foreground">
        프로필에 표시될 기술 스택을 선택해주세요. 선택한 순서대로 포트폴리오에 노출됩니다.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
      
      <div class="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
        <div class="relative">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="기술 스택 검색..."
            class="pl-9 bg-background"
          />
        </div>

        <Card class="flex-1 flex flex-col min-h-0 overflow-hidden border-2 border-primary/10 bg-muted/30">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-medium flex items-center justify-between">
              <span>선택된 기술</span>
              <Badge variant="secondary" class="font-normal">
                {{ selectedSkillsList.length }}개
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="flex-1 overflow-hidden p-0">
            <ScrollArea class="h-full px-6 pb-6">
              <div v-if="selectedSkillsList.length > 0" class="flex flex-wrap gap-2">
                <Badge
                  v-for="skill in selectedSkillsList"
                  :key="skill.skill_id"
                  variant="default"
                  class="pl-2 pr-1 py-1 text-sm cursor-pointer hover:bg-primary/90 transition-all group"
                  @click="toggleSkill(skill)"
                >
                  {{ skill.name }}
                  <X class="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100" />
                </Badge>
              </div>
              <div v-else class="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm text-center">
                <div class="bg-muted p-3 rounded-full mb-2">
                  <Wrench class="h-6 w-6 opacity-50" />
                </div>
                <p>선택된 기술 스택이 없습니다.<br />오른쪽 목록에서 추가해보세요.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card class="lg:col-span-8 flex flex-col min-h-0 overflow-hidden bg-background">
        <CardHeader class="border-b bg-muted/10 pb-4">
          <CardTitle class="text-base font-medium">전체 기술 목록</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 overflow-hidden p-0">
          <ScrollArea class="h-full">
            <div class="p-6 space-y-8">
              <template v-if="!categories || !allSkills">
                <div v-for="i in 3" :key="i" class="space-y-3">
                  <Skeleton class="h-6 w-32" />
                  <div class="flex flex-wrap gap-2">
                    <Skeleton v-for="j in 6" :key="j" class="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </template>

              <template v-else-if="groupedSkills.length === 0">
                <div class="py-12 text-center text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              </template>

              <template v-else>
                <div v-for="group in groupedSkills" :key="group.category_id" class="space-y-3">
                  <div class="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <component :is="getCategoryIcon(group.name)" class="h-4 w-4" />
                    {{ group.name }}
                  </div>
                  
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="skill in group.skills"
                      :key="skill.skill_id"
                      @click="toggleSkill(skill)"
                      class="relative inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      :class="[
                        userSkillIds.has(skill.skill_id)
                          ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      ]"
                    >
                      <Check 
                        v-if="userSkillIds.has(skill.skill_id)" 
                        class="mr-1.5 h-3.5 w-3.5" 
                      />
                      {{ skill.name }}
                    </button>
                  </div>
                  <Separator class="mt-4" />
                </div>
              </template>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
    </div>
  </div>
</template>