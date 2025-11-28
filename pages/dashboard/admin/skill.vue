<script setup lang="ts">
definePageMeta({ 
  middleware: ['auth', 'admin'], 
  layout: 'dashboard' 
});

import { h, ref } from 'vue';
import { useVueTable, getCoreRowModel, createColumnHelper, FlexRender } from '@tanstack/vue-table';
import { MoreHorizontal, Pencil, Trash2, Plus, Loader2 } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface SkillCategory {
  category_id: string
  name: string
}

const { data: categories, refresh, status } = await useFetch<SkillCategory[]>('/api/skill-categories');

const renderActions = (category: SkillCategory) => {
  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, {
          default: () => [h(MoreHorizontal, { class: 'h-4 w-4' })]
        })
      }),
      h(DropdownMenuContent, { align: 'end' }, {
        default: () => [
          h(DropdownMenuItem, { onClick: () => openModal(category) }, {
            default: () => [h(Pencil, { class: 'mr-2 h-4 w-4' }), '수정']
          }),
          h(DropdownMenuItem, { class: 'text-red-600', onClick: () => handleDelete(category.category_id) }, {
            default: () => [h(Trash2, { class: 'mr-2 h-4 w-4' }), '삭제']
          }),
        ]
      })
    ]
  });
};

const columnHelper = createColumnHelper<SkillCategory>();
const columns = [
  columnHelper.accessor('name', {
    header: '카테고리명',
    cell: (info) => h('div', { class: 'font-medium pl-2' }, info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => renderActions(row.original),
  }),
];

const table = useVueTable({
  get data() { return categories.value || [] },
  columns,
  getCoreRowModel: getCoreRowModel(),
});

const isDialogOpen = ref(false);
const isSubmitting = ref(false);
const formData = ref({ category_id: '', name: '' });

const openModal = (category?: SkillCategory) => {
  formData.value = category 
    ? { ...category } 
    : { category_id: '', name: '' };
  isDialogOpen.value = true;
};

const handleSave = async () => {
  if (!formData.value.name.trim()) return;
  isSubmitting.value = true;

  try {
    const isEdit = !!formData.value.category_id;
    const url = isEdit ? `/api/skill-categories/${formData.value.category_id}` : '/api/skill-categories';
    const method = isEdit ? 'PUT' : 'POST';

    await $fetch(url, { method, body: { name: formData.value.name } });
    await refresh();
    isDialogOpen.value = false;
  } catch (error) {
    alert('처리 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('정말로 삭제하시겠습니까?')) return;
  try {
    await $fetch(`/api/skill-categories/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (error) {
    alert('삭제 실패');
  }
};
</script>

<template>
  <div class="w-full p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">기술 스택 카테고리</h1>
      <Button @click="() => openModal()">
        <Plus class="mr-2 h-4 w-4" /> 카테고리 추가
      </Button>
    </div>

    <div class="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="status === 'pending'">
             <TableCell :colspan="columns.length" class="h-24 text-center">로딩 중...</TableCell>
          </TableRow>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">데이터가 없습니다.</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ "카테고리 " + (formData.category_id ? '수정' : '추가') }}</DialogTitle>
          <DialogDescription>카테고리 이름을 입력해주세요.</DialogDescription>
        </DialogHeader>
        
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">카테고리 이름</Label>
            <Input id="name" v-model="formData.name" class="col-span-3" @keyup.enter="handleSave" :disabled="isSubmitting" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isDialogOpen = false">취소</Button>
          <Button @click="handleSave" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ formData.category_id ? '수정' : '추가' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>