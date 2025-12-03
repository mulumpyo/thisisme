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
  MoreHorizontal, Pencil, Trash2, Plus, Loader2, AlertTriangle, 
  ChevronLeft, ChevronRight
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

interface PaginatedResponse {
  data: SkillCategory[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pagination
const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

const { data: responseData, refresh: refreshCategories, status: categoryStatus } = useFetch<PaginatedResponse>('/api/skill-categories', {
  query: computed(() => ({
    page: pagination.value.pageIndex + 1,
    limit: pagination.value.pageSize
  }))
});

const categories = computed<SkillCategory[]>(() => responseData.value?.data || []);
const totalPages = computed(() => responseData.value?.totalPages || 0);
const totalCount = computed(() => responseData.value?.count || 0);

// State
const isCategoryDialogOpen = ref(false);
const isSubmitting = ref(false);
const categoryForm = ref({ category_id: '', name: '' });

const deleteState = ref({
  isOpen: false,
  id: '',
  categoryName: '',
  affectedSkills: [] as Skill[],
  inputValue: '', 
  isLoading: false
});

const openCategoryModal = (category?: SkillCategory) => {
  categoryForm.value = category 
    ? { ...category } 
    : { category_id: '', name: '' };
  isCategoryDialogOpen.value = true;
};

const confirmDelete = async (category: SkillCategory) => {
  deleteState.value = { 
    isOpen: true, 
    id: category.category_id, 
    categoryName: category.name,
    affectedSkills: [],
    inputValue: '',
    isLoading: true
  };

  try {
    const skills = await $fetch<Skill[]>('/api/skill'); 
    deleteState.value.affectedSkills = skills.filter(s => s.category_id === category.category_id);
  } catch (e) {
    toast.error('연관 데이터 조회 실패');
  } finally {
    deleteState.value.isLoading = false;
  }
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

const executeDelete = async (e: Event) => {
  if (deleteState.value.inputValue !== '삭제') {
    e.preventDefault();
    return;
  }

  const { id } = deleteState.value;
  if (!id) return;

  try {
    await $fetch(`/api/skill-categories/${id}`, { method: 'DELETE' });
    await refreshCategories();
    deleteState.value.isOpen = false;
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
          h(DropdownMenuItem, { class: 'text-destructive focus:text-destructive', onClick: () => confirmDelete(category) }, {
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
  get data() { return categories.value },
  columns: categoryColumns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  manualPagination: true,
  get pageCount() { return totalPages.value },
  get rowCount() { return totalCount.value },
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
            <TableCell :colspan="categoryColumns.length" class="h-24 text-center">
                <div class="flex items-center justify-center gap-2">
                    <Loader2 class="h-4 w-4 animate-spin" /> 로딩 중...
                </div>
            </TableCell>
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

    <div class="flex items-center justify-end space-x-2 py-2">
        <div class="flex-1 text-sm text-muted-foreground">
            Total {{ totalCount }} items
        </div>
        <div class="space-x-2">
            <Button
                variant="outline"
                size="sm"
                :disabled="!categoryTable.getCanPreviousPage()"
                @click="categoryTable.previousPage()"
            >
                <ChevronLeft class="h-4 w-4" />
                이전
            </Button>
            <span class="text-sm font-medium">
                Page {{ pagination.pageIndex + 1 }} of {{ categoryTable.getPageCount() }}
            </span>
            <Button
                variant="outline"
                size="sm"
                :disabled="!categoryTable.getCanNextPage()"
                @click="categoryTable.nextPage()"
            >
                다음
                <ChevronRight class="h-4 w-4" />
            </Button>
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
          <AlertDialogTitle class="flex items-center gap-2 text-destructive">
            <AlertTriangle class="h-5 w-5" />
            정말 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription as="div" class="space-y-4 pt-2">
            
            <div v-if="deleteState.isLoading" class="flex items-center justify-center py-4">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
              <span class="ml-2 text-sm text-muted-foreground">연관 데이터 확인 중...</span>
            </div>

            <div v-else class="space-y-4">
              <p>
                <span class="font-bold text-foreground">{{ deleteState.categoryName }}</span> 카테고리를 삭제하려고 합니다.
                <br>이 작업은 되돌릴 수 없습니다.
              </p>

              <div v-if="deleteState.affectedSkills.length > 0" class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
                <p class="font-semibold mb-2">다음 기술 스택들도 함께 영구 삭제됩니다:</p>
                <div class="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
                    <span 
                     v-for="skill in deleteState.affectedSkills" 
                     :key="skill.skill_id"
                     class="bg-destructive/20 px-1.5 py-0.5 rounded text-xs font-medium"
                    >
                      {{ skill.name }}
                    </span>
                </div>
              </div>
              <div v-else class="text-sm text-muted-foreground">
                연관된 기술 스택이 없습니다.
              </div>

              <div class="space-y-2">
                <Label class="text-xs text-muted-foreground">
                  확인을 위해 아래 입력창에 <span class="font-bold text-foreground">삭제</span> 라고 입력해주세요.
                </Label>
                <Input 
                  v-model="deleteState.inputValue" 
                  placeholder="삭제" 
                  autocomplete="off"
                  @keyup.enter="executeDelete"
                />
              </div>
            </div>

          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteState.isOpen = false">취소</AlertDialogCancel>
          <AlertDialogAction 
            class="bg-destructive hover:bg-destructive/90" 
            @click="executeDelete"
            :disabled="deleteState.inputValue !== '삭제' || deleteState.isLoading"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>