<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { SidebarProps } from '@/components/ui/sidebar';
import type { User } from '@supabase/supabase-js';

import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-vue-next';

import NavMain from '@/components/NavMain.vue';
import NavProjects from '@/components/NavProjects.vue';
import NavUser from '@/components/NavUser.vue';
import Logo from '@/components/Logo.vue';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
});

const router = useRouter();
const { user, signOut } = useAuth();

interface CurrentUser {
  name: string
  email: string
  avatar: string
};

const currentUser = computed<CurrentUser | null>(() => {
  const u = user.value as User | null;
  if (!u) return null;

  return {
    name: (u.user_metadata?.user_name as string) || 'Unknown User',
    email: u.email || '',
    avatar: (u.user_metadata?.avatar_url as string) || '/avatars/default.jpg',
  };
});

watchEffect(() => {
  if (!user.value) router.replace('/');
});

const data = computed(() => ({
  user: currentUser.value ?? {
    name: 'Guest',
    email: 'guest@example.com',
    avatar: '/avatars/default.jpg',
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: 'History', url: '#' },
        { title: 'Starred', url: '#' },
        { title: 'Settings', url: '#' },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        { title: 'Genesis', url: '#' },
        { title: 'Explorer', url: '#' },
        { title: 'Quantum', url: '#' },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        { title: 'Introduction', url: '#' },
        { title: 'Get Started', url: '#' },
        { title: 'Tutorials', url: '#' },
        { title: 'Changelog', url: '#' },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        { title: 'General', url: '#' },
        { title: 'Team', url: '#' },
        { title: 'Billing', url: '#' },
        { title: 'Limits', url: '#' },
      ],
    },
  ],
  projects: [
    { name: 'Design Engineering', url: '#', icon: Frame },
    { name: 'Sales & Marketing', url: '#', icon: PieChart },
    { name: 'Travel', url: '#', icon: Map },
  ],
}));

const handleLogout = async () => {
  await signOut();
  router.replace('/');
};

const handleNavigateToUserProfile = () => {
  if (currentUser.value?.name) {
    router.push(`/${currentUser.value.name}`);
  } else {
    router.push('/');
  }
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <Logo @navigate-to-user-profile="handleNavigateToUserProfile" />
    </SidebarHeader>

    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="data.user" @logout="handleLogout" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
