import React from 'react';
import { X, Copy, Check, Database } from 'lucide-react';

interface SqlSetupModalProps {
  onClose?: () => void;
}

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const sqlScript = `-- SCRIPT "SEM RLS" (ACESSO TOTAL)
-- Use este script para desenvolvimento. Ele desativa as travas de segurança.

-- 1. Limpeza de Triggers e Funções antigas
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;

-- 2. Criação de Tabelas (Se não existirem)

-- 2.1 Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  role text check (role in ('client', 'distributor', 'consultant', 'super_admin')),
  whatsapp text,
  cro text,
  allowed_types text[],
  status text default 'pending' check (status in ('pending', 'active', 'inactive', 'rejected')),
  preferences jsonb default '{"theme": "light", "language": "pt-br"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.2 Materials
create table if not exists public.materials (
  id uuid default gen_random_uuid() primary key,
  title jsonb not null default '{}'::jsonb,
  type text check (type in ('pdf', 'image', 'video')),
  allowed_roles text[],
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.3 Assets
create table if not exists public.material_assets (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references public.materials on delete cascade not null,
  language text not null default 'pt-br',
  url text not null default '',
  subtitle_url text,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.4 Logs
create table if not exists public.access_logs (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references public.materials on delete set null,
  user_id uuid references public.profiles on delete set null,
  language text,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- 2.5 Config
create table if not exists public.system_config (
    id int primary key default 1,
    app_name text default 'Hub Conexão',
    logo_url text,
    webhook_url text,
    theme_light jsonb,
    theme_dark jsonb,
    updated_at timestamp with time zone default now()
);

-- 3. Trigger para Criação Automática de Usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, whatsapp, cro)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'cro'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. DESATIVAR RLS (Row Level Security)
-- Isso remove todas as restrições. O banco confia 100% no Frontend/Client.
alter table public.profiles disable row level security;
alter table public.materials disable row level security;
alter table public.material_assets disable row level security;
alter table public.access_logs disable row level security;
alter table public.system_config disable row level security;

-- 5. Conceder Permissões Totais
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- 6. Dados Iniciais Essenciais
insert into public.system_config (id) values (1) on conflict do nothing;
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render directly without Portal for robust nesting in App.tsx
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in" style={{ zIndex: 99999 }}>
      <div className="bg-surface rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up border border-yellow-500/30">
        
        <div className="p-6 border-b border-border bg-surface flex justify-between items-start">
            <div className="flex gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 animate-pulse">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-main">Configuração do Banco (Modo Aberto)</h3>
                    <p className="text-sm text-muted mt-1 max-w-lg">
                        Este script remove as políticas de segurança (RLS) para facilitar o desenvolvimento.
                        <strong>Copie e execute no Painel do Supabase > SQL Editor.</strong>
                    </p>
                </div>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main transition-colors">
                    <X size={24} />
                </button>
            )}
        </div>

        <div className="flex-1 overflow-hidden relative group bg-[#1e1e1e]">
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}
                    `}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar SQL'}
                </button>
            </div>
            <pre className="w-full h-full p-6 overflow-auto text-xs font-mono text-blue-100 leading-relaxed selection:bg-blue-500/30">
                <code>{sqlScript}</code>
            </pre>
        </div>

        <div className="p-4 bg-surface border-t border-border flex justify-between items-center">
            <p className="text-xs text-muted">Após rodar o script, recarregue esta página.</p>
            <div className="flex gap-3">
                <button onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')} className="px-4 py-2.5 rounded-lg bg-page hover:bg-muted/10 text-muted hover:text-main font-bold transition-colors text-xs uppercase tracking-wide">
                    Abrir SQL Editor
                </button>
                {onClose ? (
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-main text-page font-bold hover:opacity-90 transition-opacity">
                        Já executei
                    </button>
                ) : (
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-lg bg-accent text-white font-bold hover:opacity-90 transition-opacity">
                        Recarregar Aplicação
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};