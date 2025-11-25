<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHead, useRoute, useAsyncData } from '#app';

const route = useRoute();
const username = route.params.username as string;

const { data: user, error } = await useAsyncData<UserData>(
  `user-${username}`,
  () => $fetch(`/api/user/${username}`)
);

if (user.value) {
  const userValue = user.value;
  
  useHead({
    title: `@${userValue.username} | thisisme`,
    meta: [
      { name: 'description', content: `${userValue.username}님의 포트폴리오입니다.` },

      // Facebook / Kakao
      { property: 'og:title', content: `@${userValue.username} : thisisme` },
      { property: 'og:description', content: `쉽게 만들고 쉽게 공유하는 나만의 포트폴리오` },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: userValue.avatar_url || '/og-image.png' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `@${userValue.username} : thisisme` },
      { name: 'twitter:description', content: `쉽게 만들고 쉽게 공유하는 나만의 포트폴리오` },
      { name: 'twitter:image', content: userValue.avatar_url || '/og-image.png' }
    ]
  });
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 space-y-10">
    <div v-if="error" class="text-center py-20 text-muted-foreground">
      <h2 class="text-2xl font-semibold mb-2">사용자를 찾을 수 없습니다 😢</h2>
      <p>"{{ username }}" 님의 프로필이 존재하지 않습니다.</p>
    </div>

    <div v-else-if="!user" class="text-center py-20">
      <p class="animate-pulse text-lg text-muted-foreground">
        프로필 불러오는 중입니다...
      </p>
    </div>

    <div v-else class="space-y-12">
      <Card class="shadow-xl border-none p-8 bg-card/70 backdrop-blur-sm">
        <CardHeader class="flex flex-col items-center text-center space-y-4">
          <Avatar class="h-28 w-28 border-4 border-primary/50 shadow-lg">
            <AvatarImage :src="user.avatar_url || '/avatars/default.jpg'" />
            <AvatarFallback class="text-3xl font-bold">{{ user.username?.charAt(0).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <CardTitle class="text-4xl font-extrabold tracking-tight mt-4">
            {{ user.username }}
          </CardTitle>
        </CardHeader>
        <CardContent class="text-center pt-6">
          <p class="text-xl font-medium leading-snug whitespace-pre-line text-foreground">
            {{ user.bio || '자기소개가 아직 작성되지 않았어요 📝' }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-semibold">🧠 핵심 기술 스택</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <Badge
            v-for="(tech, index) in user.skills || []"
            :key="index"
            variant="default" 
            class="text-base px-4 py-2 font-semibold hover:ring-2 ring-primary transition-all duration-200 cursor-default"
          >
            {{ tech }}
          </Badge>
          <p v-if="!user.skills?.length" class="text-muted-foreground">
            기술 스택 정보가 없습니다 🧩
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-semibold">🌟 주요 프로젝트 (Projects)</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div
            v-for="(project, index) in user.projects || []"
            :key="index"
            class="
              p-5 border rounded-xl bg-card 
              hover:shadow-2xl hover:scale-[1.01] 
              transition duration-300 cursor-pointer
            "
          >
            <h3 class="font-bold text-xl mb-1">{{ project.title }}</h3>
            <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
              {{ project.description }}
            </p>
            <Button
              v-if="project.link"
              variant="default"
              as="a"
              :href="project.link"
              target="_blank"
              class="mt-2"
            >
              프로젝트 바로가기 →
            </Button>
          </div>
          <p v-if="!user.projects?.length" class="text-muted-foreground">
            아직 등록된 프로젝트가 없어요 🧩
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-semibold">📬 연락처 & 링크</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <Button v-if="user.links?.github" variant="outline" as="a" :href="user.links.github" target="_blank">GitHub</Button>
          <Button v-if="user.links?.blog" variant="outline" as="a" :href="user.links.blog" target="_blank">Blog</Button>
          <Button v-if="user.links?.portfolio" variant="outline" as="a" :href="user.links.portfolio" target="_blank">Portfolio</Button>
          <Button v-if="user.links?.email" variant="default" as="a" :href="`mailto:${user.links.email}`">Email (연락하기)</Button>
          <p v-if="!user.links" class="text-muted-foreground">등록된 링크가 없습니다 🔗</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>