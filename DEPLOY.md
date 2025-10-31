# 🚀 Guia de Deploy Gratuito

Este guia mostra como colocar o site no ar de forma **totalmente gratuita** com uma URL.

## ✅ Opção 1: Vercel (Recomendado - Mais Fácil)

### Passo a Passo:

1. **Criar conta no GitHub** (se ainda não tiver):
   - Acesse: https://github.com
   - Crie uma conta gratuita

2. **Fazer upload do projeto no GitHub**:
   - Crie um novo repositório no GitHub
   - Faça upload de todos os arquivos do projeto (exceto `node_modules` e `.env`)
   - **IMPORTANTE**: Nunca faça commit do arquivo `.env` com tokens

3. **Conectar ao Vercel**:
   - Acesse: https://vercel.com
   - Clique em "Sign Up" e faça login com GitHub
   - Clique em "Add New Project"
   - Importe o repositório que você criou
   - O Vercel detectará automaticamente que é um projeto Node.js

4. **Configurar variáveis de ambiente**:
   - Na seção "Environment Variables" do Vercel, adicione:
     - `DISCORD_BOT_TOKEN`: Seu token do bot Discord (do arquivo .env)

5. **Deploy**:
   - Clique em "Deploy"
   - Aguarde alguns minutos
   - Pronto! Você terá uma URL como: `seu-projeto.vercel.app`

### ✅ Vantagens do Vercel:
- ✅ Totalmente gratuito
- ✅ URL automática (.vercel.app)
- ✅ SSL/HTTPS automático
- ✅ Deploy automático ao fazer push no GitHub
- ✅ Suporta Node.js e Express

---

## 🔄 Opção 2: Render (Alternativa)

### Passo a Passo:

1. **Acesse**: https://render.com
2. **Crie uma conta** (com GitHub)
3. **Clique em "New +" → "Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Adicione `DISCORD_BOT_TOKEN`

6. **Deploy**: Clique em "Create Web Service"
7. **URL**: Você terá algo como: `seu-projeto.onrender.com`

### ⚠️ Limitação do Render:
- O serviço "dorme" após 15 minutos de inatividade
- Primeira requisição após dormir pode demorar ~30 segundos para "acordar"

---

## 🌐 Opção 3: Railway (Alternativa)

### Passo a Passo:

1. **Acesse**: https://railway.app
2. **Login com GitHub**
3. **"New Project" → "Deploy from GitHub repo"**
4. **Selecione seu repositório**
5. **Configure Environment Variables**: `DISCORD_BOT_TOKEN`
6. **Deploy automático** acontecerá

### 💰 Railway:
- Plano gratuito com $5 de crédito/mês
- Após os créditos, pode exigir pagamento

---

## ⚙️ Configurações Importantes

### Arquivos que DEVEM estar no GitHub:
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `server.js`
- ✅ `package.json`
- ✅ `vercel.json` (para Vercel)
- ✅ Pasta `songs/` com os arquivos .mp3

### Arquivos que NÃO DEVEM estar no GitHub:
- ❌ `.env` (com tokens)
- ❌ `node_modules/`
- ❌ Arquivos sensíveis

### ⚠️ IMPORTANTE - Token do Discord:
1. **Nunca** faça commit do arquivo `.env` com tokens
2. Sempre adicione as variáveis de ambiente pela interface da plataforma
3. Mantenha seu token seguro

---

## 🔧 Troubleshooting

### Site não carrega os arquivos estáticos:
- Certifique-se de que o `server.js` está servindo os arquivos corretamente
- Verifique os caminhos dos arquivos CSS e JS no HTML

### Bot do Discord não funciona:
- Verifique se o `DISCORD_BOT_TOKEN` está configurado nas variáveis de ambiente
- Certifique-se de que o bot está online e com as permissões corretas

### Erro de módulos não encontrados:
- Execute `npm install` localmente antes de fazer commit
- Certifique-se de que o `package.json` está atualizado

---

## 📝 Dica Extra: Domínio Personalizado (Opcional)

Todas as plataformas permitem usar um domínio personalizado (se você comprar um):
- Vercel: Adicione domínio nas configurações do projeto
- Render: Adicione domínio customizado no painel
- Railway: Configure domínio nas settings

---

## 🎯 Recomendação Final

**Use Vercel** - É a opção mais fácil, rápida e confiável para este tipo de projeto!
- Setup em menos de 5 minutos
- Zero configuração extra
- URL bonita automaticamente
- Deploy contínuo do GitHub

Qualquer dúvida, consulte a documentação oficial de cada plataforma.

