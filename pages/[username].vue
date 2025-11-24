<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const route = useRoute();
const username = route.params.username as string;

const { data: user, error } = await useAsyncData(
  `user-${username}`,
  () => $fetch(`/api/user/${username}`)
);

useHead({
  title: `@${username} | thisisme`,
  meta: [
    { name: 'description', content: `${username}님의 포트폴리오입니다.` },
    
    // Facebook / Kakao
    { property: 'og:title', content: `@${username} : thisisme` },
    { property: 'og:description', content: `쉽게 만들고 쉽게 공유하는 나만의 포트폴리오` },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.png' },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `@${username} : thisisme` },
    { name: 'twitter:description', content: `쉽게 만들고 쉽게 공유하는 나만의 포트폴리오` },
    { name: 'twitter:image', content: '/og-image.png' }
  ]
});
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

    <div v-else class="space-y-10">
      <Card>
        <CardHeader class="flex flex-col items-center text-center space-y-3">
          <Avatar class="h-24 w-24">
            <AvatarImage :src="user.avatar || '/avatars/default.jpg'" />
            <AvatarFallback>{{ user.username?.charAt(0).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <CardTitle class="text-2xl font-bold">
            {{ user.username }}
          </CardTitle>
          <p class="text-muted-foreground">{{ user.email }}</p>
        </CardHeader>
        <CardContent class="text-center">
          <p class="text-base leading-relaxed whitespace-pre-line">
            {{ user.bio || '자기소개가 아직 작성되지 않았어요 📝' }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📬 연락처 & 링크</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <Button v-if="user.links?.github" variant="outline" as="a" :href="user.links.github" target="_blank">GitHub</Button>
          <Button v-if="user.links?.blog" variant="outline" as="a" :href="user.links.blog" target="_blank">Blog</Button>
          <Button v-if="user.links?.portfolio" variant="outline" as="a" :href="user.links.portfolio" target="_blank">Portfolio</Button>
          <Button v-if="user.links?.email" variant="outline" as="a" :href="`mailto:${user.links.email}`">Email</Button>
          <p v-if="!user.links">등록된 링크가 없습니다 🔗</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚀 핵심 프로젝트</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="(project, index) in user.projects || []"
            :key="index"
            class="p-4 border rounded-lg hover:shadow transition"
          >
            <h3 class="font-semibold text-lg">{{ project.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ project.description }}</p>
            <a
              v-if="project.link"
              :href="project.link"
              target="_blank"
              class="text-primary underline text-sm mt-2 inline-block"
            >
              프로젝트 보기 →
            </a>
          </div>
          <p v-if="!user.projects?.length" class="text-muted-foreground">
            아직 등록된 프로젝트가 없어요 🧩
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧠 기술 스택</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-2">
          <Badge
            v-for="(tech, index) in user.skills || []"
            :key="index"
            variant="secondary"
            class="text-sm px-3 py-1"
          >
            {{ tech }}
          </Badge>
          <p v-if="!user.skills?.length" class="text-muted-foreground">
            기술 스택 정보가 없습니다 🧩
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
