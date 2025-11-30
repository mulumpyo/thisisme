<script setup lang="ts">
import { h, ref } from 'vue';
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

interface SkillCategory {
  category_id: string
  name: string
}

const { data: categories, refresh: refreshCategories, status: categoryStatus } = await useFetch<SkillCategory[]>('/api/skill-categories');

const isCategoryDialogOpen = ref(false);
const isSubmitting = ref(false);
const categoryForm = ref({ category_id: '', name: '' });
const deleteState = ref({
  isOpen: false,
  id: ''
});

const openCategoryModal = (category?: SkillCategory) => {
  categoryForm.value = category 
    ? { ...category } 
    : { category_id: '', name: '' };
  isCategoryDialogOpen.value = true;
};

const confirmDelete = (id: string) => {
  deleteState.value = { isOpen: true, id };
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

const executeDelete = async () => {
  const { id } = deleteState.value;
  if (!id) return;

  deleteState.value.isOpen = false; 

  try {
    await $fetch(`/api/skill-categories/${id}`, { method: 'DELETE' });
    await refreshCategories();
    toast.success('카테고리가 삭제되었습니다.');
  } catch (error) {
    toast.error('삭제 실패');
  }
};

// Table
const categoryHelper = createColumnHelper<SkillCategory>();

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
          h(DropdownMenuItem, { class: 'text-destructive focus:text-destructive', onClick: () => confirmDelete(category.category_id) }, {
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

const categoryTable = useVueTable({
  get data() { return categories.value || [] },
  columns: categoryColumns,
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <Button @click="() => openCategoryModal()">
        <Plus class="mr-2 h-4 w-4" />카테고리 추가
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

    <Dialog :open="isCategoryDialogOpen" @update:open="isCategoryDialogOpen = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ categoryForm.category_id ? '카테고리 수정' : '카테고리 추가' }}</DialogTitle>
          <DialogDescription>카테고리 이름을 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="cat-name" class="text-right">이름</Label>
            <Input 
              id="cat-name" 
              v-model="categoryForm.name" 
              class="col-span-3" 
              @keyup.enter="handleSaveCategory" 
              :disabled="isSubmitting" 
            />
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

    <AlertDialog :open="deleteState.isOpen" @update:open="deleteState.isOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 해당 카테고리가 영구적으로 삭제됩니다.
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