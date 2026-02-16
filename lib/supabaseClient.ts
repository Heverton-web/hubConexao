import { createClient } from '@supabase/supabase-js';

// Acesso seguro às variáveis de ambiente injetadas pelo Vite
const getEnv = (key: string) => {
  const meta = import.meta as any;
  return meta?.env?.[key];
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback apenas para evitar crash inicial se as envs não existirem
// O usuário verá um erro claro no console ou o Modal de SQL se tentar usar.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env. Usando placeholders.');
}

export const supabase = createClient(
    SUPABASE_URL || FALLBACK_URL, 
    SUPABASE_ANON_KEY || FALLBACK_KEY
);