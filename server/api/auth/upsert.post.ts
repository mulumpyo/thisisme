import { createClient, type User } from '@supabase/supabase-js';

interface Profile {
  user_id: string;
  email?: string;
  username: string | null;
  avatar_url: string | null;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { user } = await readBody(event) as { user: User };

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'User required' });
  }

  const supabaseServer = createClient(
    config.public.supabaseUrl,
    config.supabaseSecretKey
  );

  const profileData: Profile = {
    user_id: user.id,
    email: user.email,
    username:
      user.user_metadata?.user_name ??
      user.user_metadata?.preferred_username ??
      null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  const upsertProfile = async (data: Profile): Promise<{ username: string | null }> => {
    const { data: upsertedData, error } = await supabaseServer
      .from('users')
      .upsert(data)
      .select('username')
      .single();

    if (error) throw error;
    return upsertedData;
  };

  try {
    const finalProfile = await upsertProfile(profileData);
    return { username: finalProfile.username };
  } catch (err: any) {
    if (err.code === '23505') {
      profileData.username = `${profileData.username}-${Math.random().toString(36).substring(2, 6)}`;
      try {
        const finalProfile = await upsertProfile(profileData);
        return { username: finalProfile.username };
      } catch (retryErr: any) {
        throw createError({ statusCode: 500, statusMessage: `Failed to create unique user: ${retryErr.message}` });
      }
    }
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
