const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🤖 Bot is ready to raid!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'raid') {
    const message = interaction.options.getString('message');
    const count = interaction.options.getInteger('count') || 5;

    // Limit to prevent abuse
    if (count > 20) {
      return interaction.reply({ 
        content: '❌ Maximum spam count is 20.', 
        ephemeral: true 
      });
    }

    if (count < 1) {
      return interaction.reply({ 
        content: '❌ Count must be at least 1.', 
        ephemeral: true 
      });
    }

    // Acknowledge the command
    await interaction.reply({ 
      content: `🚀 **Raid started!**\n📝 Message: "${message}"\n🔢 Count: ${count}\n⏱️ Please wait...`, 
      ephemeral: true 
    });

    // Send spam messages
    for (let i = 0; i < count; i++) {
      await interaction.channel.send(message);
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Optional: Send completion message
    await interaction.followUp({ 
      content: `✅ Raid completed! Sent "${message}" ${count} times.`, 
      ephemeral: true 
    }).catch(() => {});
  }
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
