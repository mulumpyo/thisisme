import { createClient, type User } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const skillId = event.context.params?.id;

  if (!skillId) {
    throw createError({ statusCode: 400, statusMessage: '삭제할 Skill ID가 필요합니다.' });
  }

  const config = useRuntimeConfig();
  let user: User | null = null;
  
  const adminClient = createClient(config.public.supabaseUrl, config.supabaseSecretKey);
  const accessToken = getCookie(event, 'sb-access-token');

  if (accessToken) {
    const { data: userData } = await adminClient.auth.getUser(accessToken);
    if (userData.user) {
      user = userData.user;
    }
  }

  if (!user) {
    const refreshToken = getCookie(event, 'sb-refresh-token');
    if (!refreshToken) {
      throw createError({ statusCode: 401, statusMessage: '인증 토큰이 없습니다.' });
    }

    const authClient = createClient(config.public.supabaseUrl, config.public.supabaseKey, {
      auth: { persistSession: false },
    });
    const { data: refreshData, error: refreshError } = await authClient.auth.refreshSession({ refresh_token: refreshToken });

    if (refreshError || !refreshData.session) {
      throw createError({ statusCode: 401, statusMessage: `세션 갱신에 실패했습니다: ${refreshError?.message}` });
    }

    setCookie(event, 'sb-access-token', refreshData.session.access_token, { path: '/', sameSite: 'lax', maxAge: 60 * 60 });
    setCookie(event, 'sb-refresh-token', refreshData.session.refresh_token, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    user = refreshData.session.user;
  }

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '최종적으로 사용자를 확인할 수 없습니다.' });
  }

  const { error } = await adminClient
    .from('user_skills')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_id', skillId);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true };
});