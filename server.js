import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (index.html, styles.css, etc.)
app.use(express.static(__dirname, {
  maxAge: '1d',
  etag: true
}));
app.use(express.json({ limit: '200kb' }));

// Serve CSS explicitly (before API routes to avoid conflicts)
app.get('/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'styles.css'));
});

// Serve audio files (before API routes)
app.get('/songs/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'songs', req.params.file));
});

// Add CORS headers for video loading
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve index.html for root route (must be after static files)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simple JSON file storage for comments and social links
const dataDir = path.join(__dirname, 'data');
const commentsFile = path.join(dataDir, 'comments.json');
const socialLinksFile = path.join(dataDir, 'social-links.json');
const glowColorsFile = path.join(dataDir, 'glow-colors.json');

async function ensureStorage() {
  try { await fs.mkdir(dataDir, { recursive: true }); } catch {}
  try { await fs.access(commentsFile); }
  catch { await fs.writeFile(commentsFile, JSON.stringify({}), 'utf8'); }
  try { await fs.access(socialLinksFile); }
  catch { await fs.writeFile(socialLinksFile, JSON.stringify({}), 'utf8'); }
  try { await fs.access(glowColorsFile); }
  catch { await fs.writeFile(glowColorsFile, JSON.stringify({}), 'utf8'); }
}

async function readComments() {
  await ensureStorage();
  const raw = await fs.readFile(commentsFile, 'utf8');
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

async function writeComments(obj) {
  await ensureStorage();
  await fs.writeFile(commentsFile, JSON.stringify(obj, null, 2), 'utf8');
}

async function readSocialLinks() {
  await ensureStorage();
  const raw = await fs.readFile(socialLinksFile, 'utf8');
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

async function writeSocialLinks(obj) {
  await ensureStorage();
  await fs.writeFile(socialLinksFile, JSON.stringify(obj, null, 2), 'utf8');
}

async function readGlowColors() {
  await ensureStorage();
  const raw = await fs.readFile(glowColorsFile, 'utf8');
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

async function writeGlowColors(obj) {
  await ensureStorage();
  await fs.writeFile(glowColorsFile, JSON.stringify(obj, null, 2), 'utf8');
}

// Simple API to fetch user data from Discord securely (server-side)
app.get('/api/user/:id', async (req, res) => {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: 'DISCORD_BOT_TOKEN not configured' });
  }
  const { id } = req.params;
  try {
    const r = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: 'Discord API error', details: text });
    }
    const user = await r.json();
    const avatarHash = user.avatar || null;
    const avatarExt = avatarHash && avatarHash.startsWith('a_') ? 'gif' : 'png';
    const avatarUrl = avatarHash
      ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${avatarExt}?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png?size=128`;
    // Map public_flags to badges
    const badgeCatalog = {
      DISCORD_EMPLOYEE: { key: 'employee', name: 'Discord Staff', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Discord_Employee.svg' },
      PARTNER: { key: 'partner', name: 'Partnered Server Owner', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Partnered_Server_Owner.svg' },
      HYPESQUAD_EVENTS: { key: 'hypesquad_events', name: 'HypeSquad Events', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/HypeSquad_Events.svg' },
      BUGHUNTER_LEVEL_1: { key: 'bughunter1', name: 'Bug Hunter', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Bug_Hunter.svg' },
      BUGHUNTER_LEVEL_2: { key: 'bughunter2', name: 'Bug Hunter Level 2', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Bug_Hunter_Level_2.svg' },
      EARLY_SUPPORTER: { key: 'early_supporter', name: 'Early Supporter', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Early_Supporter.svg' },
      HOUSE_BRAVERY: { key: 'bravery', name: 'HypeSquad Bravery', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/HypeSquad_Bravery.svg' },
      HOUSE_BRILLIANCE: { key: 'brilliance', name: 'HypeSquad Brilliance', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/HypeSquad_Brilliance.svg' },
      HOUSE_BALANCE: { key: 'balance', name: 'HypeSquad Balance', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/HypeSquad_Balance.svg' },
      DISCORD_CERTIFIED_MODERATOR: { key: 'cert_mod', name: 'Discord Certified Moderator', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Discord_Certified_Moderator.svg' },
      EARLY_VERIFIED_BOT_DEVELOPER: { key: 'early_dev', name: 'Early Verified Bot Developer', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Early_Verified_Bot_Developer.svg' },
      ACTIVE_DEVELOPER: { key: 'active_dev', name: 'Active Developer', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Active_Developer.svg' }
    };

    const Flags = {
      DISCORD_EMPLOYEE: 1 << 0,
      PARTNER: 1 << 1,
      HYPESQUAD_EVENTS: 1 << 2,
      BUGHUNTER_LEVEL_1: 1 << 3,
      HOUSE_BRAVERY: 1 << 6,
      HOUSE_BRILLIANCE: 1 << 7,
      HOUSE_BALANCE: 1 << 8,
      EARLY_SUPPORTER: 1 << 9,
      BUGHUNTER_LEVEL_2: 1 << 14,
      EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
      DISCORD_CERTIFIED_MODERATOR: 1 << 18,
      ACTIVE_DEVELOPER: 1 << 22
    };
    const userFlags = user.public_flags || 0;
    const badges = Object.keys(Flags)
      .filter(k => (userFlags & Flags[k]) !== 0)
      .map(k => badgeCatalog[k])
      .filter(Boolean);

    // Nitro badges via premium_type (not part of public_flags)
    // 0 = none, 1 = Nitro Classic (legacy), 2 = Nitro, 3 = Nitro Basic
    const premiumType = Number(user.premium_type || 0);
    if (premiumType === 1 || premiumType === 2) {
      badges.push({ key: 'nitro', name: 'Nitro', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Nitro.svg' });
    } else if (premiumType === 3) {
      badges.push({ key: 'nitro_basic', name: 'Nitro Basic', icon: 'https://cdn.jsdelivr.net/gh/Tjstretchalot/discord-badges@master/badges/Nitro_Basic.svg' });
    }

    res.json({
      id: user.id,
      username: user.global_name || user.username,
      tag: `@${user.username}`,
      avatarHash: avatarHash,
      avatarUrl,
      badges
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e?.message || String(e) });
  }
});

// Comments API
app.get('/api/comments/:id', async (req, res) => {
  const all = await readComments();
  const list = Array.isArray(all[req.params.id]) ? all[req.params.id] : [];
  res.json(list);
});

app.post('/api/comments', async (req, res) => {
  const { userId, text } = req.body || {};
  if (!userId || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing userId or text' });
  }
  const safeText = String(text).slice(0, 500);
  const entry = {
    id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
    userId: String(userId),
    text: safeText,
    at: new Date().toISOString()
  };
  const all = await readComments();
  if (!Array.isArray(all[entry.userId])) all[entry.userId] = [];
  all[entry.userId].unshift(entry);
  await writeComments(all);
  res.json({ ok: true, entry });
});

// Social links API
app.get('/api/social-links/:id', async (req, res) => {
  const all = await readSocialLinks();
  const links = Array.isArray(all[req.params.id]) ? all[req.params.id] : [];
  res.json(links);
});

// Glow colors API
app.get('/api/glow-color/:id', async (req, res) => {
  const all = await readGlowColors();
  const color = all[req.params.id] || null;
  res.json({ color });
});

app.post('/api/social-links', async (req, res) => {
  const { userId, platform, href } = req.body || {};
  if (!userId || !platform || !href) {
    return res.status(400).json({ error: 'Missing userId, platform or href' });
  }
  const all = await readSocialLinks();
  const userIdStr = String(userId);
  if (!Array.isArray(all[userIdStr])) all[userIdStr] = [];
  // Remove existing link for this platform
  all[userIdStr] = all[userIdStr].filter(l => l.platform !== platform);
  // Add new link
  all[userIdStr].push({ platform, href: String(href).slice(0, 500), at: new Date().toISOString() });
  await writeSocialLinks(all);
  res.json({ ok: true });
});

// IDs de perfis no site (configurável)
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

// Exportar app para Vercel (serverless)
export default app;

// Iniciar servidor localmente
if (!process.env.VERCEL && !process.env.RENDER) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
    startDiscordBot();
  });
} else {
  // No Vercel/Render, iniciar bot Discord após um delay
  setTimeout(() => {
    startDiscordBot();
  }, 2000);
}

// Discord Bot
async function startDiscordBot() {
  const { Client, GatewayIntentBits } = await import('discord.js');
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.log('DISCORD_BOT_TOKEN not set, skipping bot initialization');
    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  client.once('ready', () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(',')) return;

    const args = message.content.slice(1).trim().split(/\s+/);
    const command = args[0]?.toLowerCase();
    const link = args.slice(1).join(' ').trim();

    if (!command) return;

    const userId = message.author.id;
    // Verifica se o usuário está nos perfis do site
    if (!PROFILE_IDS.includes(userId)) return; // Não faz nada se não estiver na lista

    // Função para converter nome de cor para hex (suporta nomes comuns, hex direto e cores CSS)
    function colorNameToHex(colorName) {
      let lower = colorName.toLowerCase().trim();
      // Adiciona # se for hex mas não tiver #
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
      // Se é hex válido, retorna diretamente
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(lower)) {
        return lower;
      }
      // Se é um nome conhecido, retorna o hex
      if (colorMap[lower]) {
        return colorMap[lower];
      }
      // Aceita hex direto (#RRGGBB ou #RGB)
      return null;
    }

    // Verifica se é um comando de COR
    const colorHex = colorNameToHex(command);
    if (colorHex) {
      // Não permite preto ou cores muito escuras
      const rgb = parseInt(colorHex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      const brightness = (r + g + b) / 3;
      if (brightness < 30) {
        return; // Muito escuro/preto, não faz nada
      }

      try {
        const all = await readGlowColors();
        const userIdStr = String(userId);
        all[userIdStr] = colorHex;
        await writeGlowColors(all);

        // Buscar nome do usuário
        let userName = message.author.globalName || message.author.username || userIdStr;
        try {
          const botToken = process.env.DISCORD_BOT_TOKEN;
          const r = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${botToken}` }
          });
          if (r.ok) {
            const user = await r.json();
            userName = user.global_name || user.username || userIdStr;
          }
        } catch {}

        await message.reply(`cor alterada para **${colorHex}** no perfil de **${userName}**`);
      } catch (e) {
        console.error('Error saving glow color:', e);
      }
      return;
    }

    const platformKey = SOCIAL_ICON_MAP[command];
    if (!platformKey) return; // Comando não reconhecido, não faz nada

    // Mapear nomes das plataformas para português
    const platformNames = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      roblox: 'Roblox',
      discord: 'Discord',
      steam: 'Steam',
      telegram: 'Telegram'
    };

    // Buscar nome do usuário via API do Discord
    let userName = message.author.globalName || message.author.username || String(userId);
    try {
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const r = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: { Authorization: `Bot ${botToken}` }
      });
      if (r.ok) {
        const user = await r.json();
        userName = user.global_name || user.username || String(userId);
      }
    } catch {}

    const platformName = platformNames[platformKey] || platformKey;
    const userIdStr = String(userId);

    // Se não tem link, REMOVE a plataforma
    if (!link || (!link.startsWith('http://') && !link.startsWith('https://'))) {
      try {
        const all = await readSocialLinks();
        if (Array.isArray(all[userIdStr])) {
          const hadLink = all[userIdStr].some(l => l.platform === platformKey);
          all[userIdStr] = all[userIdStr].filter(l => l.platform !== platformKey);
          await writeSocialLinks(all);
          if (hadLink) {
            await message.reply(`${platformName} removido do perfil de **${userName}**`);
          }
        }
      } catch (e) {
        console.error('Error removing social link:', e);
      }
      return;
    }

    // Se tem link, ADICIONA/ATUALIZA o link
    try {
      const all = await readSocialLinks();
      if (!Array.isArray(all[userIdStr])) all[userIdStr] = [];
      all[userIdStr] = all[userIdStr].filter(l => l.platform !== platformKey);
      all[userIdStr].push({ platform: platformKey, href: link, at: new Date().toISOString() });
      await writeSocialLinks(all);
      await message.reply(`url do ${platformName} adicionada ao perfil de **${userName}**`);
    } catch (e) {
      console.error('Error saving social link:', e);
    }
  });

  try {
    await client.login(botToken);
  } catch (e) {
    console.error('Failed to login Discord bot:', e.message);
  }
}


