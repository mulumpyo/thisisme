<script setup lang="ts">
import { h, ref, computed } from 'vue';
import { 
  useVueTable, 
  getCoreRowModel, 
  createColumnHelper, 
  FlexRender, 
  getPaginationRowModel
} from '@tanstack/vue-table';
import { 
  MoreHorizontal, Pencil, Trash2, Plus, Loader2, 
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-vue-next';
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

// Types
interface SkillCategory {
  category_id: string
  name: string
}

interface Skill {
  skill_id: string
  category_id: string
  name: string
}

const { data: categoriesData } = await useFetch<any>('/api/skill-categories');
const { data: skills, refresh: refreshSkills, status: skillStatus } = await useFetch<Skill[]>('/api/skill');

const categoryList = computed<SkillCategory[]>(() => {
  if (!categoriesData.value) return [];
  return Array.isArray(categoriesData.value) ? categoriesData.value : (categoriesData.value.data || []);
});

// Pagination
const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

// State
const isSkillDialogOpen = ref(false);
const isSubmitting = ref(false);
const skillForm = ref({ skill_id: '', category_id: '', name: '' });
const deleteState = ref({
  isOpen: false,
  id: ''
});

const openSkillModal = (skill?: Skill) => {
  skillForm.value = skill 
    ? { ...skill } 
    : { skill_id: '', category_id: '', name: '' };
  isSkillDialogOpen.value = true;
};

const confirmDelete = (id: string) => {
  deleteState.value = { isOpen: true, id };
};

const handleSaveSkill = async () => {
  if (!skillForm.value.name.trim() || !skillForm.value.category_id) {
    toast.error('카테고리와 이름을 모두 입력해주세요.');
    return;
  }
  isSubmitting.value = true;

  try {
    const isEdit = !!skillForm.value.skill_id;
    const url = isEdit ? `/api/skill/${skillForm.value.skill_id}` : '/api/skill';
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

const executeDelete = async () => {
  const { id } = deleteState.value;
  if (!id) return;

  deleteState.value.isOpen = false; 

  try {
    await $fetch(`/api/skill/${id}`, { method: 'DELETE' });
    await refreshSkills();
    toast.success('기술 스택이 삭제되었습니다.');
  } catch (error) {
    toast.error('삭제 실패');
  }
};

const skillHelper = createColumnHelper<Skill>();

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
          h(DropdownMenuItem, { class: 'text-destructive focus:text-destructive', onClick: () => confirmDelete(skill.skill_id) }, {
            default: () => [h(Trash2, { class: 'mr-2 h-4 w-4' }), '삭제']
          }),
        ]
      })
    ]
  });
};

const skillColumns = [
  skillHelper.accessor('name', {
    header: '기술명',
    cell: (info) => h('div', { class: 'font-medium pl-2' }, info.getValue()),
  }),
  skillHelper.accessor('category_id', {
    header: '카테고리',
    cell: (info) => {
      const cat = categoryList.value.find(c => c.category_id === info.getValue());
      return h('div', { class: 'text-muted-foreground text-sm' }, cat?.name || '-');
    }
  }),
  skillHelper.display({
    id: 'actions',
    cell: ({ row }) => renderSkillActions(row.original),
  }),
];

const skillTable = useVueTable({
  get data() { return skills.value || [] },
  columns: skillColumns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get pagination() { return pagination.value },
  },
  onPaginationChange: (updaterOrValue) => {
    pagination.value = typeof updaterOrValue === 'function'
      ? updaterOrValue(pagination.value)
      : updaterOrValue
  },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex text-sm text-muted-foreground">
        총 기술 스택 수 {{ skills?.length || 0 }}
      </div>
      <Button @click="() => openSkillModal()">
        <Plus class="mr-2 h-4 w-4" />기술 스택 추가
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
            <TableCell :colspan="skillColumns.length" class="h-24 text-center">
                <div class="flex items-center justify-center gap-2">
                    <Loader2 class="h-4 w-4 animate-spin" /> 로딩 중...
                </div>
            </TableCell>
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

    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">
        총 {{ skillTable.getPageCount() }} 페이지 중 {{ pagination.pageIndex + 1 }}
      </span>
      
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!skillTable.getCanPreviousPage()"
          @click="skillTable.previousPage()"
        >
          <ChevronLeft class="h-4 w-4" />
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!skillTable.getCanNextPage()"
          @click="skillTable.nextPage()"
        >
          다음
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

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
                      v-for="cat in categoryList" 
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
            <Input 
              id="skill-name" 
              v-model="skillForm.name" 
              class="col-span-3" 
              @keyup.enter="handleSaveSkill" 
              :disabled="isSubmitting" 
            />
          </div>
        </div>
        <DialogFooter class="flex flex-row justify-end gap-2">
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
          <AlertDialogTitle class="flex items-center justify-center sm:justify-start gap-2 text-destructive text-center sm:text-left">
            <AlertTriangle class="h-5 w-5" />
            정말 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription class="text-center sm:text-left">
            이 작업은 되돌릴 수 없습니다. 해당 기술 스택이 영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="flex flex-row justify-end gap-2">
          <AlertDialogCancel @click="deleteState.isOpen = false" class="mt-0">취소</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive hover:bg-destructive/90" @click="executeDelete">
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>