<script setup lang="ts">
import { Github } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/composables/useAuth';

useHead({
  title: 'thisisme',
  meta: [
    { name: 'description', content: '나만의 포트폴리오를 빠르게 만들고 SNS에서 공유하세요!' },
    
    // Facebook / Kakao
    { property: 'og:title', content: 'thisisme – 나만의 포트폴리오 공유 플랫폼' },
    { property: 'og:description', content: '쉽게 만들고 쉽게 공유하는 나만의 포트폴리오' },
    { property: 'og:type', content: 'website' },
    // { property: 'og:image', content: '/og-image.png' },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'thisisme – 나만의 포트폴리오 공유 플랫폼' },
    { name: 'twitter:description', content: '쉽게 만들고 쉽게 공유하는 나만의 포트폴리오' },
    // { name: 'twitter:image', content: '/og-image.png' }
  ]
});

const { signInWithGithub } = useAuth();

const handleLogin = async () => {
  try {
    await signInWithGithub();
  }
  catch (err) {
    console.error('Login failed:', err);
  }
};

definePageMeta({
  layout: 'page',
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background p-4">
    <div class="w-full max-w-md space-y-6 text-center">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          thisisme
        </h1>
        <p class="text-lg text-muted-foreground sm:text-xl">
          코드를 넘어, 온전한 당신을 보여주세요 😆
        </p>
      </div>
      <Button size="lg" class="w-full max-w-xs cursor-pointer" @click="handleLogin">
        <div class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900">
          <Github class="h-4 w-4 text-white" />
        </div>
        GitHub 계정으로 시작하기
      </Button>
    </div>
    <footer class="absolute bottom-4 text-center text-sm text-muted-foreground">
      <p>&copy; {{ new Date().getFullYear() }} thisisme. All rights reserved.</p>
    </footer>
  </div>
</template>
