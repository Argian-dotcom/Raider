const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'raid',
    description: 'Start a spam raid in this channel',
    options: [
      {
        name: 'message',
        description: 'The message to spam',
        type: 3,
        required: true,
      },
      {
        name: 'count',
        description: 'Number of times to spam (max 20)',
        type: 4,
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering GLOBAL commands...');
    // WALANG guild ID dito
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Global commands registered. Will appear in 1-2 hours.');
  } catch (error) {
    console.error('Error:', error);
  }
})();
