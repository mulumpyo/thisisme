import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const body = await readBody(event);
  const { name, category_id } = body;

  if (!name || !category_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'name과 category_id는 필수 항목입니다.'
    });
  }

  const { data, error } = await supabase
    .from('skills')
    .insert([
      {
        name,
        category_id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return data;
});