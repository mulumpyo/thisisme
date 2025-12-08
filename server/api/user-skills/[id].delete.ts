import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const skillId = event.context.params?.id;

  if (!skillId) {
    throw createError({ statusCode: 400, statusMessage: '삭제할 Skill ID가 필요합니다.' });
  }

  const config = useRuntimeConfig();

  const accessToken = getCookie(event, 'sb-access-token');
  const refreshToken = getCookie(event, 'sb-refresh-token');

  if (!accessToken || !refreshToken) {
    throw createError({ statusCode: 401, statusMessage: '인증 토큰이 없습니다.' });
  }

  const supabaseAuth = createClient(config.public.supabaseUrl, config.public.supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: { session }, error: sessionError } = await supabaseAuth.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (sessionError) {
    throw createError({ statusCode: 401, statusMessage: `세션 설정 실패: ${sessionError.message}` });
  }
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '유효하지 않은 토큰으로 세션을 만들 수 없습니다.' });
  }

  if (session.access_token && session.access_token !== accessToken) {
    setCookie(event, 'sb-access-token', session.access_token, { path: '/', sameSite: 'lax', maxAge: 60 * 60 });
  }
  if (session.refresh_token && session.refresh_token !== refreshToken) {
    setCookie(event, 'sb-refresh-token', session.refresh_token, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
  }

  const user = session.user;

  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { error } = await supabaseAdmin
    .from('user_skills')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_id', skillId);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true };
});