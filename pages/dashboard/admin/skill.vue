<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
});

import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table' 

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

interface Item {
  id: string
  name: string
  price: number
}

const columnHelper = createColumnHelper<Item>();

const data: Item[] = [
  { id: "a1", name: "Notebook", price: 1200000 },
  { id: "b2", name: "Mouse", price: 50000 },
  { id: "c3", name: "Keyboard", price: 150000 },
]

const columns = [
  columnHelper.accessor('name', {
    header: '카테고리명',
    id: 'name',
    cell: info => h('div', { class: 'font-medium' }, info.getValue()),
  }),
]
</script>

<template>
  <div class="w-full p-8">
    <h1 class="text-2xl font-bold mb-4">기술 스택 카테고리</h1>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              v-for="column in columns" 
              :key="column.id"
            >
              카테고리명
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="item in data" :key="item.id">
            <TableCell class="font-medium">
              {{ item.name }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>