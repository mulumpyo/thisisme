import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID parameter is missing' });
  }

  const config = useRuntimeConfig();
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('skill_id', id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  setResponseStatus(event, 204);
  return null;
});