import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const username = event.context.params?.username;

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username not provided',
    });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  return data;
});