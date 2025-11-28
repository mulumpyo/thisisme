import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { data, error } = await supabase
    .from('skill_category')
    .update(body)
    .eq('category_id', id)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});