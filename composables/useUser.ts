import type { User } from '@supabase/supabase-js';

export const useUser = () => {
  const user = useState<User | null>('user', () => null);
  return user;
};