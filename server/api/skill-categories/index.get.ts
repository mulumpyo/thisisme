import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { data, error } = await supabase
    .from('skill_category')
    .select('*');

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});