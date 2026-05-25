const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
require('dotenv').config();

// ========== HTTP SERVER PARA KAY RENDER ==========
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Raid Bot is running!');
});

app.listen(PORT, () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
});

// ========== DISCORD BOT SETUP ==========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ========== SLASH COMMAND DEFINITION ==========
const commands = [
  {
    name: 'raid',
    description: 'Mag-spam ng mensahe sa channel na ito',
    options: [
      {
        name: 'message',
        description: 'Ang mensahe na ipapa-spam',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'count',
        description: 'Bilang ng beses (max 20, default 5)',
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
];

// ========== GLOBAL COMMAND REGISTRATION ==========
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerGlobalCommands() {
  try {
    console.log('🔄 Nagre-register ng global slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Global commands registered! Lalabas sa lahat ng server sa loob ng 1-2 oras.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

// ========== BOT READY EVENT ==========
client.once('ready', async () => {
  console.log(`✅ Naka-login bilang ${client.user.tag}`);
  await registerGlobalCommands();
});

// ========== /raid COMMAND HANDLER ==========
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  // Siguraduhing /raid command ito
  if (interaction.commandName === 'raid') {
    const message = interaction.options.getString('message');
    const count = interaction.options.getInteger('count') || 5;

    // Validation
    if (count > 20) {
      return interaction.reply({ 
        content: '❌ Hindi pwedeng lumampas sa 20 ang count.', 
        ephemeral: true 
      });
    }
    if (count < 1) {
      return interaction.reply({ 
        content: '❌ Dapat 1 pataas ang count.', 
        ephemeral: true 
      });
    }

    // I-acknowledge ang command
    await interaction.reply({ 
      content: `🚀 **Raid started!**\nMensahe: "${message}"\nBilang: ${count}\nMaghintay lamang...`, 
      ephemeral: true 
    });

    // I-spam ang mensahe
    for (let i = 0; i < count; i++) {
      await interaction.channel.send(message);
      // Delay para iwas rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Opsyonal na completion message
    await interaction.followUp({ 
      content: `✅ Tapos na! Na-spam ang "${message}" ng ${count} beses.`, 
      ephemeral: true 
    }).catch(() => {});
  }
});

// ========== LOGIN ==========
client.login(process.env.DISCORD_TOKEN);
