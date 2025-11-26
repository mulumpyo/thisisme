import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserLink {
  github?: string;
  blog?: string;
  portfolio?: string;
  email?: string;
}

interface UserProject {
  title: string;
  description: string;
  link?: string;
}

interface UserData {
  uuid: string;
  username: string;
  avatar_url: string | null;
  bio?: string;
  skills?: string[];
  links?: UserLink;
  projects?: UserProject[];
}

export interface User extends SupabaseUser {
  role?: number;
}
