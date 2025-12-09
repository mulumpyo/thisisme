import { createClient, type User } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { skill_id } = body;

  if (!skill_id) {
    throw createError({ statusCode: 400, statusMessage: 'skill_id는 필수입니다.' });
  }

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

  // Ensure user profile exists to prevent foreign key violations
  const baseUsername = (user.user_metadata?.user_name ?? user.user_metadata?.preferred_username) || user.email?.split('@')[0];
  if (!baseUsername) {
    throw createError({ statusCode: 500, statusMessage: '사용자 이름을 생성할 수 없습니다.' });
  }

  const profileData = {
    user_id: user.id,
    email: user.email,
    username: baseUsername,
    avatar_url: user.user_metadata?.avatar_url,
  };

  try {
    const { error: upsertError } = await adminClient.from('users').upsert(profileData, { onConflict: 'user_id' });
    if (upsertError) throw upsertError;
  } catch (error: any) {
    if (error.code === '23505') { // Handle unique username collision
      try {
        profileData.username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
        const { error: retryError } = await adminClient.from('users').upsert(profileData, { onConflict: 'user_id' });
        if (retryError) throw retryError;
      } catch (retryError: any) {
        throw createError({ statusCode: 500, statusMessage: `사용자 프로필 업데이트 중 재시도 실패: ${retryError.message}` });
      }
    } else {
      console.error('Error upserting user profile in skill API:', error);
      throw createError({ statusCode: 500, statusMessage: `사용자 프로필 업데이트 중 오류 발생: ${error.message}` });
    }
  }

  const { data: maxOrderData } = await adminClient
    .from('user_skills')
    .select('order_index')
    .eq('user_id', user.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrderIndex = (maxOrderData?.order_index ?? -1) + 1;

  const { data, error } = await adminClient
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
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});