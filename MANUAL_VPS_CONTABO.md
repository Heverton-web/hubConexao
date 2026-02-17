# Guia de Implantação em VPS (Contabo / Linux) - Hub Conexão

Este manual descreve como hospedar o **Hub Conexão** em uma VPS (Contabo, DigitalOcean, etc.). Ele cobre a instalação padrão (Nginx) e a integração com a popular **Stack Onion** (Docker + Traefik + n8n + Evolution).

---

## 1. Pré-requisitos

* Servidor VPS com **Ubuntu 22.04 LTS** (recomendado).
* Acesso SSH ao servidor.
* Um domínio apontando para o IP da sua VPS (A Record).
* Projeto configurado no Supabase (conforme o `MANUAL_IMPLANTACAO.md`).
* **Opcional**: Se você já usa a **Stack Onion**, o Hub pode rodar como um container Docker integrado ao seu Traefik.

---

## 2. Preparação do Servidor

Acesse sua VPS via SSH e execute os comandos para atualizar o sistema e instalar o Node.js:

```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (Versão 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx e Git
sudo apt install -y nginx git
```

---

## 3. Clonagem e Construção do Projeto

Crie uma pasta para o projeto e prepare os arquivos:

```bash
# Navegar para a pasta web
sudo mkdir -p /var/www/hub-conexao
sudo chown -R $USER:$USER /var/www/hub-conexao
cd /var/www/hub-conexao

# Clonar seu repositório (substitua pela sua URL)
git clone https://github.com/seu-usuario/hub-conexao.git .

# Instalar dependências
npm install

# Criar arquivo de ambiente
nano .env
```

No arquivo `.env`, cole suas chaves do Supabase:

```env
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key
VITE_MOCK_MODE=false
```

Gere a versão de produção:

```bash
npm run build
```

---

## 4. Configuração do Nginx

O Nginx servirá os arquivos estáticos gerados na pasta `dist`.

```bash
# Criar arquivo de configuração do site
sudo nano /etc/nginx/sites-available/hub-conexao
```

Cole a configuração abaixo (substitua `seu-dominio.com` pelo seu domínio real):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/hub-conexao/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de ativos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Segurança básica
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/hub-conexao /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Configuração de SSL (HTTPS Grátis)

Para garantir que a plataforma seja segura e o Supabase Auth funcione corretamente, instale o SSL via Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

Siga as instruções na tela. O Certbot configurará automaticamente a renovação do certificado e o redirecionamento de HTTP para HTTPS.

---

## 6. Sincronização com Supabase Auth

1. Acesse o painel do **Supabase** > **Authentication** > **URL Configuration**.
2. Adicione `https://seu-dominio.com` à lista de **Additional Redirect URLs**.
3. Atualize a **Site URL** caso necessário.

---

## 7. Atualizando a Aplicação (Continuous Deployment Manual)

Sempre que fizer alterações no código, basta rodar na VPS:

```bash
cd /var/www/hub-conexao
git pull
npm install
npm run build
# Não é necessário reiniciar o Nginx, os novos arquivos em /dist serão lidos automaticamente.
```

---

## 9. Integração com a Stack Onion (Docker + Traefik)

Se você já utiliza a **Stack Onion** (geralmente via Docker + Traefik para n8n, Evolution API, Typebot), a melhor forma de implantar o Hub é via Docker para aproveitar o SSL automático e a rede interna.

### 1. Criar o Dockerfile

Crie um arquivo chamado `Dockerfile` na raiz do seu projeto:

```dockerfile
# Estágio de Build
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Produção
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Configuração para React Router (SPA)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $$uri $$uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Adicionar ao Docker Compose

No seu servidor com Onion, adicione este serviço ao seu arquivo principal ou crie um `docker-compose.hub.yml`:

```yaml
services:
  hub-conexao:
    build: .
    container_name: hub-conexao
    restart: always
    networks:
      - proxy # Altere para o nome da rede usada pelo seu Traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.hub-conexao.rule=Host(`hub.seu-dominio.com`)"
      - "traefik.http.routers.hub-conexao.entrypoints=websecure"
      - "traefik.http.routers.hub-conexao.tls.certresolver=letsencrypt"
      - "traefik.http.services.hub-conexao.loadbalancer.server.port=80"
```

### 3. Vantagens na Stack Onion

* **SSL Automático**: O Traefik gerencia os certificados Let's Encrypt automaticamente.
* **Isolamento**: O Hub roda em seu próprio container, sem conflitos de versão de Node.js.
* **Ecossistema**: Facilita a comunicação com a Evolution API e n8n que já estão na mesma rede.

---

## 10. Conclusão

Pronto! Seu **Hub Conexão** está agora rodando em uma infraestrutura VPS robusta e escalável, seja via Nginx puro ou integrado à sua stack de automação.
