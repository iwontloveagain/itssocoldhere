import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

// URL do seu site no Vercel - ATUALIZE AQUI!
// Opção 1: Defina no .env como VERCEL_URL=https://seu-site.vercel.app
// Opção 2: Edite diretamente aqui:
const VERCEL_URL = process.env.VERCEL_URL || 'https://itssocoldhere.vercel.app'; // ⚠️ MUDE PARA SUA URL DO VERCEL!

const botToken = process.env.DISCORD_BOT_TOKEN;
if (!botToken) {
  console.error('❌ DISCORD_BOT_TOKEN não configurado no .env');
  process.exit(1);
}

// IDs de perfis no site
const PROFILE_IDS = ['1098101847014777002', '1419932037053153402'];

// Mapa de comandos para ícones
const SOCIAL_ICON_MAP = {
  insta: 'instagram',
  instagram: 'instagram',
  tiktok: 'tiktok',
  roblox: 'roblox',
  discord: 'discord',
  steam: 'steam',
  telegram: 'telegram'
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`🌐 Comunicando com: ${VERCEL_URL}`);
});

// Função para fazer requisições à API do Vercel
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const url = `${VERCEL_URL}${endpoint}`;
    console.log(`[API] ${method} ${url}`);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
      console.log(`[API] Body:`, body);
    }
    const res = await fetch(url, options);
    console.log(`[API] Status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Erro HTTP ${res.status}:`, errorText);
      return { ok: false, error: `HTTP ${res.status}: ${errorText}` };
    }
    
    const data = await res.json();
    console.log(`[API] Resposta:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Erro na requisição para ${endpoint}:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Função para converter nome de cor para hex
function colorNameToHex(colorName) {
  let lower = colorName.toLowerCase().trim();
  if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(lower)) {
    lower = '#' + lower;
  }
  const colorMap = {
    'azul': '#3b82f6', 'blue': '#3b82f6',
    'vermelho': '#ef4444', 'red': '#ef4444',
    'verde': '#10b981', 'green': '#10b981',
    'amarelo': '#fbbf24', 'yellow': '#fbbf24',
    'roxo': '#a855f7', 'purple': '#a855f7', 'rox': '#a855f7',
    'rosa': '#ec4899', 'pink': '#ec4899',
    'laranja': '#f97316', 'orange': '#f97316',
    'ciano': '#06b6d4', 'cyan': '#06b6d4',
    'branco': '#ffffff', 'white': '#ffffff',
    'cinza': '#6b7280', 'gray': '#6b7280', 'grey': '#6b7280',
    'aqua': '#00ffff', 'fuchsia': '#ff00ff', 'lime': '#00ff00',
    'maroon': '#800000', 'navy': '#000080', 'olive': '#808000',
    'silver': '#c0c0c0', 'teal': '#008080'
  };
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(lower)) {
    return lower;
  }
  if (colorMap[lower]) {
    return colorMap[lower];
  }
  return null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(',')) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const command = args[0]?.toLowerCase();
  const link = args.slice(1).join(' ').trim();

  if (!command) return;

  const userId = message.author.id;
  if (!PROFILE_IDS.includes(userId)) return;

  // Verifica se é comando de COR
  const colorHex = colorNameToHex(command);
  if (colorHex) {
    const rgb = parseInt(colorHex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const brightness = (r + g + b) / 3;
    if (brightness < 30) {
      return; // Muito escuro
    }

    try {
      const result = await apiRequest('/api/glow-color', 'POST', {
        userId: userId,
        color: colorHex
      });

      if (result && result.ok) {
        let userName = message.author.globalName || message.author.username || userId;
        try {
          const r = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${botToken}` }
          });
          if (r.ok) {
            const user = await r.json();
            userName = user.global_name || user.username || userId;
          }
        } catch {}

        await message.reply(`cor do glow alterada para **${colorHex}** no perfil de **${userName}**`);
      } else {
        const errorMsg = result?.error || 'Erro desconhecido';
        console.error(`[Bot] Falha ao atualizar cor:`, errorMsg);
        await message.reply(`❌ Erro ao atualizar cor: ${errorMsg}\nVerifique se o site está online e a URL do Vercel está correta no bot.js`);
      }
    } catch (e) {
      console.error('Error updating glow color:', e);
      await message.reply('❌ Erro ao atualizar cor.');
    }
    return;
  }

  // Verifica se é comando de plataforma social
  const platformKey = SOCIAL_ICON_MAP[command];
  if (!platformKey) return;

  const platformNames = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    roblox: 'Roblox',
    discord: 'Discord',
    steam: 'Steam',
    telegram: 'Telegram'
  };

  let userName = message.author.globalName || message.author.username || userId;
  try {
    const r = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    if (r.ok) {
      const user = await r.json();
      userName = user.global_name || user.username || userId;
    }
  } catch {}

  const platformName = platformNames[platformKey] || platformKey;

  try {
    // Buscar links atuais para verificar se existe
    const currentLinks = await apiRequest(`/api/social-links/${userId}`);
    const hadLink = Array.isArray(currentLinks) && currentLinks.some(l => l.platform === platformKey);

    // Atualizar/remover link
    const result = await apiRequest('/api/social-links', 'POST', {
      userId: userId,
      platform: platformKey,
      href: link && (link.startsWith('http://') || link.startsWith('https://')) ? link : null
    });

    if (result && result.ok) {
      if (!link || (!link.startsWith('http://') && !link.startsWith('https://'))) {
        if (hadLink) {
          await message.reply(`${platformName} removido do perfil de **${userName}**`);
        }
      } else {
        await message.reply(`url do ${platformName} adicionada ao perfil de **${userName}**`);
      }
    } else {
      const errorMsg = result?.error || 'Erro desconhecido';
      console.error(`[Bot] Falha ao atualizar link:`, errorMsg);
      await message.reply(`❌ Erro ao atualizar link: ${errorMsg}\nVerifique se o site está online e a URL do Vercel está correta no bot.js`);
    }
  } catch (e) {
    console.error('Error updating social link:', e);
    await message.reply('❌ Erro ao atualizar link.');
  }
});

// Conectar bot
try {
  await client.login(botToken);
  console.log('🚀 Bot iniciando...');
} catch (e) {
  console.error('❌ Falha ao conectar bot:', e.message);
  process.exit(1);
}

