import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const config = useRuntimeConfig();
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { error } = await supabase
    .from('skill_category')
    .delete()
    .eq('category_id', id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  setResponseStatus(event, 204)
  return null;
});