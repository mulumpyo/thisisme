import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = createClient(config.public.supabaseUrl, config.supabaseSecretKey);
  const query = getQuery(event);

  if (!query.page && !query.limit) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return data || [];
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };

});