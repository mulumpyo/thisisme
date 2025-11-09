<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSupabase } from '#imports';

type AuthState = 'loading' | 'manualRedirect' | 'error';

const supabase = useSupabase();
const router = useRouter();
const route = useRoute();

const state = ref<AuthState>('loading');
const message = ref("깃허브와 하이파이브 중... 🖐️");

const redirectTo = (to: string = '/') => router.replace(to);

useHead({
  title: '로그인 중.. | thisisme',
  meta: [{ name: 'description', content: '로그인 후 리다이렉션하는 페이지에요.' }],
});

onMounted(() => {
  const timer = setTimeout(() => {
    if (state.value === 'loading') state.value = 'manualRedirect';
  }, 5000);
  onUnmounted(() => clearTimeout(timer));
});

const handleError = (msg: string, redirectPath = '/') => {
  state.value = 'error';
  message.value = msg;
  setTimeout(() => redirectTo(redirectPath), 2000);
};

if (route.query.error || route.query.error_description) {
  console.error('Auth callback URL error:', route.query.error_description || route.query.error);
  handleError("로그인 중 오류가 발생했어요 😢");
} else {
  let unsubscribe: (() => void) | null = null;

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        unsubscribe?.();
        try {
          message.value = "로그인 중... ✍️";

          const { username } = await $fetch('/api/auth/upsert', {
            method: 'POST',
            body: { user: session.user },
          });

          message.value = "곧 대시보드로 안내할게요 🚀";

          if (username) {
            setTimeout(() => redirectTo('/dashboard'), 600);
          } else {
            handleError("문제가 생겼어요 😢");
          }
        } catch (err) {
          console.error('Auth callback upsert error:', err);
          handleError("문제가 생겼어요 😢");
        }
      } else if (event === 'SIGNED_OUT') {
        handleError("깃허브가 하이파이브를 받아주지 않았어요. 😢");
      } else if (event === 'INITIAL_SESSION' && !session?.user) {
        handleError("세션이 만료되었어요. 😢");
      }
    },
  );

  unsubscribe = () => authListener?.subscription.unsubscribe();
  onUnmounted(() => unsubscribe?.());
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-background text-foreground transition-colors duration-300">
    <div class="relative flex flex-col items-center space-y-6 text-center p-6">

      <!-- 로딩 애니메이션 -->
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-muted animate-ping opacity-75"></div>
        <div class="absolute inset-0 rounded-full border-4 border-primary animate-spin border-t-transparent"></div>
        <div class="absolute inset-0 flex items-center justify-center text-sm font-bold">thisisme</div>
      </div>

      <!-- 상태 메시지 -->
      <p class="text-xl font-bold sm:text-xl">{{ message }}</p>

      <!-- 안내문 -->
      <template v-if="state === 'loading'">
        <p class="text-sm text-muted-foreground mb-4">
          잠시만 기다려 주세요. 당신의 무대로 연결 중이에요 ✨
        </p>
      </template>

      <template v-else-if="state === 'manualRedirect'">
        <p class="text-sm text-muted-foreground mb-4">
          혹시나 이동하지 않는다면
          <span
            @click="redirectTo('/dashboard')"
            class="text-primary font-semibold cursor-pointer underline transition"
          >여기</span>를 눌러주세요 🙂
        </p>
      </template>

      <template v-else-if="state === 'error'">
        <p class="text-sm text-muted-foreground mb-4">
          다시 로그인 해주세요 🙏
        </p>
      </template>

    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-ping,
  .animate-spin {
    animation: none !important;
  }
}
</style>