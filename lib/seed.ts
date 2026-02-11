import { createClient } from '@supabase/supabase-js';

// NOTA DE SEGURANÇA: Chave Service Role exposta apenas para demonstração/protótipo conforme solicitado.
// Em produção, isso deve ser executado via script backend ou Edge Function para não expor a chave administrativa.
const SUPABASE_URL = 'https://mojqcygmahwrrypbhgrk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanFjeWdtYWh3cnJ5cGJoZ3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzNTYyMCwiZXhwIjoyMDg2NDExNjIwfQ.J1gaXX36wJDTL3LOTazYfKXYqEbiFfEnh4JrCuOegrg';

export const seedUsers = async () => {
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const users = [
    { email: 'admin@demo.com', password: '123456', role: 'super_admin', name: 'Super Admin' },
    { email: 'client@demo.com', password: '123456', role: 'client', name: 'Cliente Demo' },
    { email: 'distributor@demo.com', password: '123456', role: 'distributor', name: 'Distribuidor Demo' },
    { email: 'consultant@demo.com', password: '123456', role: 'consultant', name: 'Consultor Demo' },
  ];

  const results: string[] = [];

  for (const u of users) {
    // 1. Criar usuário no Auth (bypass email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name }
    });

    let userId = authData.user?.id;
    let msg = '';

    if (authError) {
      // Se usuário já existe, tentamos buscar o ID pelo email na tabela profiles para garantir a role
      // Nota: admin.createUser falha se o email já existe.
      const { data: profileData } = await supabaseAdmin.from('profiles').select('id').eq('email', u.email).single();
      if (profileData) {
        userId = profileData.id;
        msg = '(Usuário já existia - Perfil atualizado)';
      } else {
        results.push(`⚠️ ${u.role}: Usuário Auth já existe mas perfil não encontrado. Tente fazer login.`);
        continue;
      }
    } else {
      msg = '(Conta Criada com Sucesso)';
    }

    if (userId) {
      // 2. Garantir Perfil e Role correta via upsert
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: u.email,
        name: u.name,
        role: u.role,
        whatsapp: '11999999999',
        status: 'active', // Força status ativo
        preferences: { theme: 'light', language: 'pt-br' }
      });

      if (profileError) {
        results.push(`❌ ${u.role}: Erro ao criar perfil - ${profileError.message}`);
      } else {
        results.push(`✅ ${u.role} ${msg}`);
      }
    }
  }

  return results.join('\n');
};