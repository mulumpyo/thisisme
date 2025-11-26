import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  const user = useUser();

  const accessToken = useCookie('sb-access-token');
  const refreshToken = useCookie('sb-refresh-token');

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        storage: {
          getItem: (key) => {
            const cookie = key === 'sb-access-token' ? accessToken.value : refreshToken.value;
            return cookie ?? null;
          },
          setItem: (key, value) => {
            if (key === 'sb-access-token') {
              accessToken.value = value;
            } else {
              refreshToken.value = value;
            }
          },
          removeItem: (key) => {
            if (key === 'sb-access-token') {
              accessToken.value = null;
            } else {
              refreshToken.value = null;
            }
          },
        },
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );

  const setSessionUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      user.value = {
        ...session.user,
        role: profile?.role ?? 1,
      };
    } else {
      user.value = null;
    }
  };

  await setSessionUser();

  supabase.auth.onAuthStateChange(() => {
    setSessionUser();
  });

  return {
    provide: {
      supabase,
    },
  };
});