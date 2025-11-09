import { useSupabase, useUser } from '#imports';

export const useAuth = () => {
  const supabase = import.meta.client ? useSupabase() : null;
  const user = useUser();
  const router = useRouter();

  const redirectTo = import.meta.dev
    ? 'http://localhost:3000/auth/callback'
    : 'https://mulumpyo.com/auth/callback';

  const signInWithGithub = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace('/');
  };

  const restoreSession = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;
  };

  return { user, signInWithGithub, signOut, restoreSession };
};