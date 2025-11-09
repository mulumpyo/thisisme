export const useSupabase = () => {
  const { $supabase } = useNuxtApp();
  return $supabase;
};