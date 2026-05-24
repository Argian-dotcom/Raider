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
        type: 3, // STRING
        required: true,
      },
      {
        name: 'count',
        description: 'Number of times to spam (max 20, default 5)',
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering GLOBAL slash commands...');
    console.log('⏳ This will take 1-2 hours to reflect on all servers');
    
    // ITO ang binago: GLOBAL commands (walang guild ID)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), 
      { body: commands }
    );
    
    console.log('✅ Global slash commands registered successfully!');
    console.log('📝 Commands will be available in ALL servers within 1-2 hours');
    
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
