import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { skill_id } = body;

  if (!skill_id) {
    throw createError({ statusCode: 400, statusMessage: 'skill_id는 필수입니다.' });
  }

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

  const username = (user.user_metadata?.user_name ?? user.user_metadata?.preferred_username) || user.email?.split('@')[0];
  if (!username) {
    throw createError({ statusCode: 500, statusMessage: '사용자 이름을 생성할 수 없습니다.' });
  }

  const { error: upsertError } = await supabaseAdmin.from('users').upsert({
    user_id: user.id,
    email: user.email,
    username,
    avatar_url: user.user_metadata?.avatar_url,
  }, { onConflict: 'user_id' });

  if (upsertError) {
    console.error('Error upserting user profile in skill API:', upsertError);
    throw createError({ statusCode: 500, statusMessage: `사용자 프로필 업데이트 중 오류 발생: ${upsertError.message}` });
  }

  const { data: maxOrderData } = await supabaseAdmin
    .from('user_skills')
    .select('order_index')
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrderIndex = (maxOrderData?.order_index ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from('user_skills')
    .insert([
      {
        user_id: user.id,
        skill_id: skill_id,
        order_index: nextOrderIndex
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: '이미 추가된 기술 스택입니다.' });
    }
    console.error('Error inserting user skill:', error);
    throw createError({ statusCode: 500, statusMessage: `기술 스택을 추가하지 못했습니다: ${error.message}` });
  }

  return data;
});