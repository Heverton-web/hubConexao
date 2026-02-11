import { createClient } from '@supabase/supabase-js';

// Substitua estas variáveis pelas suas credenciais reais do Supabase
// Em produção, use import.meta.env.VITE_SUPABASE_URL

// Função auxiliar para acesso seguro às variáveis de ambiente
const getEnv = (key: string) => {
  const meta = import.meta as any;
  return meta?.env?.[key];
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://mojqcygmahwrrypbhgrk.supabase.co';
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanFjeWdtYWh3cnJ5cGJoZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzU2MjAsImV4cCI6MjA4NjQxMTYyMH0.PeHw-sf-gsxaWNA-at3PXmurSp1KLzK8KiIoGBLlilc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);