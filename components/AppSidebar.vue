<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { SidebarProps } from '@/components/ui/sidebar';
import NavMenu from '~/components/NavMenu.vue';
import NavUser from '@/components/NavUser.vue';
import Logo from '@/components/Logo.vue';
import menu from '~/config/menu';

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

const userData = ref({
  name: user.value?.user_metadata?.user_name || 'Unknown User',
  email: user.value?.email || '',
  avatar: user.value?.user_metadata?.avatar_url || '/avatars/default.jpg',
});

watch(
  user,
  (newUser) => {
    if (newUser) {
      userData.value = {
        name: (newUser.user_metadata?.user_name as string) || 'Unknown User',
        email: newUser.email || '',
        avatar: (newUser.user_metadata?.avatar_url as string) || '/avatars/default.jpg',
      };
    }
  },
  { immediate: true }
);

watch(user, (val) => {
  if (!val) {
     router.replace('/');
  }
});

const handleLogout = async () => {
  await signOut();
  router.replace('/');
};

</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <Logo />
    </SidebarHeader>

    <SidebarContent>
      <NavMenu :items="menu" />
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="userData" @logout="handleLogout" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>