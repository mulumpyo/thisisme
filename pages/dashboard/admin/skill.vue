<script setup lang="ts">
definePageMeta({ 
  middleware: ['auth', 'admin'], 
  layout: 'dashboard' 
});

useHead({
  title: `기술 스택 관리 | thisisme`,
});

import { h, ref, computed } from 'vue';
import { useVueTable, getCoreRowModel, createColumnHelper, FlexRender } from '@tanstack/vue-table';
import { MoreHorizontal, Pencil, Trash2, Plus, Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog'; 
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface SkillCategory {
  category_id: string
  name: string
}

interface Skill {
  skill_id: string
  category_id: string
  name: string
}

const { data: categories, refresh: refreshCategories, status: categoryStatus } = await useFetch<SkillCategory[]>('/api/skill-categories');
const { data: skills, refresh: refreshSkills, status: skillStatus } = await useFetch<Skill[]>('/api/skills');

const categoryHelper = createColumnHelper<SkillCategory>();
const skillHelper = createColumnHelper<Skill>();

const renderCategoryActions = (category: SkillCategory) => {
  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, {
          default: () => [h(MoreHorizontal, { class: 'h-4 w-4' })]
        })
      }),
      h(DropdownMenuContent, { align: 'end' }, {
        default: () => [
          h(DropdownMenuItem, { onClick: () => openCategoryModal(category) }, {
            default: () => [h(Pencil, { class: 'mr-2 h-4 w-4' }), '수정']
          }),
          h(DropdownMenuItem, { class: 'text-destructive focus:text-destructive', onClick: () => confirmDelete('category', category.category_id) }, {
            default: () => [h(Trash2, { class: 'mr-2 h-4 w-4' }), '삭제']
          }),
        ]
      })
    ]
  });
};

const renderSkillActions = (skill: Skill) => {
  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, {
          default: () => [h(MoreHorizontal, { class: 'h-4 w-4' })]
        })
      }),
      h(DropdownMenuContent, { align: 'end' }, {
        default: () => [
          h(DropdownMenuItem, { onClick: () => openSkillModal(skill) }, {
            default: () => [h(Pencil, { class: 'mr-2 h-4 w-4' }), '수정']
          }),
          h(DropdownMenuItem, { class: 'text-destructive focus:text-destructive', onClick: () => confirmDelete('skill', skill.skill_id) }, {
            default: () => [h(Trash2, { class: 'mr-2 h-4 w-4' }), '삭제']
          }),
        ]
      })
    ]
  });
};

const categoryColumns = [
  categoryHelper.accessor('name', {
    header: '카테고리명',
    cell: (info) => h('div', { class: 'font-medium pl-2' }, info.getValue()),
  }),
  categoryHelper.display({
    id: 'actions',
    cell: ({ row }) => renderCategoryActions(row.original),
  }),
];

const skillColumns = [
  skillHelper.accessor('name', {
    header: '기술명',
    cell: (info) => h('div', { class: 'font-medium pl-2' }, info.getValue()),
  }),
  skillHelper.accessor('category_id', {
    header: '카테고리',
    cell: (info) => {
      const cat = categories.value?.find(c => c.category_id === info.getValue());
      return h('div', { class: 'text-muted-foreground text-sm' }, cat?.name || '-');
    }
  }),
  skillHelper.display({
    id: 'actions',
    cell: ({ row }) => renderSkillActions(row.original),
  }),
];

const categoryTable = useVueTable({
  get data() { return categories.value || [] },
  columns: categoryColumns,
  getCoreRowModel: getCoreRowModel(),
});

const skillTable = useVueTable({
  get data() { return skills.value || [] },
  columns: skillColumns,
  getCoreRowModel: getCoreRowModel(),
});

const isCategoryDialogOpen = ref(false);
const isSkillDialogOpen = ref(false);
const isSubmitting = ref(false);
const categoryForm = ref({ category_id: '', name: '' });
const skillForm = ref({ skill_id: '', category_id: '', name: '' });

const deleteState = ref({
  isOpen: false,
  type: '' as 'category' | 'skill',
  id: ''
});

const openCategoryModal = (category?: SkillCategory) => {
  categoryForm.value = category 
    ? { ...category } 
    : { category_id: '', name: '' };
  isCategoryDialogOpen.value = true;
};

const openSkillModal = (skill?: Skill) => {
  skillForm.value = skill 
    ? { ...skill } 
    : { skill_id: '', category_id: '', name: '' };
  isSkillDialogOpen.value = true;
};

const handleSaveCategory = async () => {
  if (!categoryForm.value.name.trim()) return;
  isSubmitting.value = true;

  try {
    const isEdit = !!categoryForm.value.category_id;
    const url = isEdit ? `/api/skill-categories/${categoryForm.value.category_id}` : '/api/skill-categories';
    const method = isEdit ? 'PUT' : 'POST';

    await $fetch(url, { method, body: { name: categoryForm.value.name } });
    await refreshCategories();
    isCategoryDialogOpen.value = false;
    toast.success(isEdit ? '카테고리 수정됨' : '카테고리 추가됨');
  } catch (error) {
    toast.error('카테고리 저장 실패');
  } finally {
    isSubmitting.value = false;
  }
};

const handleSaveSkill = async () => {
  if (!skillForm.value.name.trim() || !skillForm.value.category_id) return;
  isSubmitting.value = true;

  try {
    const isEdit = !!skillForm.value.skill_id;
    const url = isEdit ? `/api/skills/${skillForm.value.skill_id}` : '/api/skills';
    const method = isEdit ? 'PUT' : 'POST';

    await $fetch(url, { 
      method, 
      body: { 
        name: skillForm.value.name,
        category_id: skillForm.value.category_id 
      } 
    });
    await refreshSkills();
    isSkillDialogOpen.value = false;
    toast.success(isEdit ? '기술 스택 수정됨' : '기술 스택 추가됨');
  } catch (error) {
    toast.error('기술 스택 저장 실패');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (type: 'category' | 'skill', id: string) => {
  deleteState.value = { isOpen: true, type, id };
};

const executeDelete = async () => {
  const { type, id } = deleteState.value;
  if (!id) return;

  deleteState.value.isOpen = false; 

  try {
    const endpoint = type === 'category' ? 'skill-categories' : 'skills';
    await $fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
    
    if (type === 'category') await refreshCategories();
    else await refreshSkills();
    
    toast.success('삭제되었습니다.');
  } catch (error) {
    toast.error('삭제 실패');
  }
};
</script>

<template>
  <div class="w-full p-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">카테고리 관리</h1>
          <Button @click="() => openCategoryModal()">
            <Plus class="mr-2 h-4 w-4" /> 추가
          </Button>
        </div>

        <div class="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in categoryTable.getHeaderGroups()" :key="headerGroup.id">
                <TableHead v-for="header in headerGroup.headers" :key="header.id">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="categoryStatus === 'pending'">
                <TableCell :colspan="categoryColumns.length" class="h-24 text-center">로딩 중...</TableCell>
              </TableRow>
              <template v-else-if="categoryTable.getRowModel().rows?.length">
                <TableRow v-for="row in categoryTable.getRowModel().rows" :key="row.id">
                  <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-else>
                <TableCell :colspan="categoryColumns.length" class="h-24 text-center">데이터가 없습니다.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">기술 스택 관리</h1>
          <Button @click="() => openSkillModal()">
            <Plus class="mr-2 h-4 w-4" /> 추가
          </Button>
        </div>

        <div class="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in skillTable.getHeaderGroups()" :key="headerGroup.id">
                <TableHead v-for="header in headerGroup.headers" :key="header.id">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="skillStatus === 'pending'">
                <TableCell :colspan="skillColumns.length" class="h-24 text-center">로딩 중...</TableCell>
              </TableRow>
              <template v-else-if="skillTable.getRowModel().rows?.length">
                <TableRow v-for="row in skillTable.getRowModel().rows" :key="row.id">
                  <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-else>
                <TableCell :colspan="skillColumns.length" class="h-24 text-center">데이터가 없습니다.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>

    <Dialog :open="isCategoryDialogOpen" @update:open="isCategoryDialogOpen = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ categoryForm.category_id ? '카테고리 수정' : '카테고리 추가' }}</DialogTitle>
          <DialogDescription>카테고리 이름을 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="cat-name" class="text-right">이름</Label>
            <Input id="cat-name" v-model="categoryForm.name" class="col-span-3" @keyup.enter="handleSaveCategory" :disabled="isSubmitting" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isCategoryDialogOpen = false">취소</Button>
          <Button @click="handleSaveCategory" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ categoryForm.category_id ? '수정' : '추가' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog :open="isSkillDialogOpen" @update:open="isSkillDialogOpen = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ skillForm.skill_id ? '기술 스택 수정' : '기술 스택 추가' }}</DialogTitle>
          <DialogDescription>기술 스택 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">카테고리</Label>
            <div class="col-span-3">
              <Select v-model="skillForm.category_id">
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem 
                      v-for="cat in categories" 
                      :key="cat.category_id" 
                      :value="cat.category_id"
                    >
                      {{ cat.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="skill-name" class="text-right">이름</Label>
            <Input id="skill-name" v-model="skillForm.name" class="col-span-3" @keyup.enter="handleSaveSkill" :disabled="isSubmitting" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isSkillDialogOpen = false">취소</Button>
          <Button @click="handleSaveSkill" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ skillForm.skill_id ? '수정' : '추가' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="deleteState.isOpen" @update:open="deleteState.isOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 영구적으로 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteState.isOpen = false">취소</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive hover:bg-destructive/90" @click="executeDelete">
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>