import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  if (!body.name) {
    throw createError({ statusCode: 400, statusMessage: '카테고리 이름은 필수 입력값입니다.' });
  }

  const { data, error } = await supabase
    .from('skill_category')
    .insert(body)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});