# 🤖 Rodar Bot Discord Localmente

Este guia mostra como rodar o bot Discord no seu PC e fazer ele se comunicar com a API do Vercel.

## ⚙️ Configuração

### 1. Configure a URL do Vercel no `bot.js`:

Abra o arquivo `bot.js` e encontre a linha:
```javascript
const VERCEL_URL = process.env.VERCEL_URL || 'https://seu-site.vercel.app';
```

**Mude para a URL do seu site no Vercel**, por exemplo:
```javascript
const VERCEL_URL = process.env.VERCEL_URL || 'https://itssocoldhere.vercel.app';
```

### 2. Configure o arquivo `.env`:

Certifique-se de que seu arquivo `.env` tem:
```env
DISCORD_BOT_TOKEN=seu_token_aqui
VERCEL_URL=https://sua-url.vercel.app
```

**OU** você pode editar diretamente no `bot.js` a URL do Vercel.

---

## 🚀 Como Rodar

### Opção 1: Usando npm script
```bash
npm run bot
```

### Opção 2: Direto com node
```bash
node bot.js
```

---

## ✅ Como Funciona

1. **Bot roda no seu PC** → Conecta ao Discord
2. **Usuário usa comando no Discord** → Ex: `,instagram https://...`
3. **Bot faz requisição HTTP** → Para a API do Vercel (`POST /api/social-links`)
4. **Vercel atualiza os dados** → Salva no arquivo JSON
5. **Site atualiza automaticamente** → Perfis mostram os novos links

---

## 📋 Comandos Disponíveis

- **Cores**: `,azul`, `,vermelho`, `,verde`, etc. ou `,#ff0000`
- **Instagram**: `,instagram https://...` ou `,instagram` (remove)
- **TikTok**: `,tiktok https://...` ou `,tiktok` (remove)
- **Roblox**: `,roblox https://...` ou `,roblox` (remove)
- **Discord**: `,discord https://...` ou `,discord` (remove)
- **Steam**: `,steam https://...` ou `,steam` (remove)
- **Telegram**: `,telegram https://...` ou `,telegram` (remove)

---

## ⚠️ Importante

1. **Mantenha o bot rodando** → Precisa estar sempre online para funcionar
2. **URL do Vercel correta** → Certifique-se de usar a URL correta do seu site
3. **Token no .env** → O `DISCORD_BOT_TOKEN` deve estar configurado
4. **Conexão com internet** → Precisa estar online para fazer requisições ao Vercel

---

## 🔍 Troubleshooting

### Bot não conecta:
- Verifique se `DISCORD_BOT_TOKEN` está correto no `.env`
- Verifique se o bot tem as permissões necessárias no Discord Developer Portal

### Erro ao atualizar links:
- Verifique se a URL do Vercel está correta no `bot.js`
- Verifique se o site está online (acesse no navegador)
- Veja os logs do bot para mais detalhes

### Bot não responde:
- Verifique se o ID do usuário está na lista `PROFILE_IDS` no `bot.js`
- Verifique se o comando está correto (precisa começar com `,`)

---

## 📝 Exemplo de Uso

1. Abra o terminal na pasta do projeto
2. Execute: `npm run bot`
3. Você verá: `✅ Bot conectado como SeuBot#1234`
4. No Discord, use: `,instagram https://www.instagram.com/seu_perfil/`
5. O bot responde e atualiza o site automaticamente!

---

**Pronto!** O bot está rodando localmente e se comunicando com a API do Vercel! 🎉

