<script lang="ts">
export const description
  = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
useHead({
  title: '대시보드 | thisisme',
  meta: [
    { name: 'description', content: '온전한 당신을 표현해보세요.' }
  ]
});

definePageMeta({
  middleware: 'auth',
  ssr: false,
  layout: 'dashboard',
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
      <div class="bg-muted/50 aspect-video rounded-xl" />
      <div class="bg-muted/50 aspect-video rounded-xl" />
      <div class="bg-muted/50 aspect-video rounded-xl" />
    </div>
    <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
  </div>
</template>