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
    console.log('🔄 Registering slash commands...');
    
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID, 
        process.env.GUILD_ID
      ), 
      { body: commands }
    );
    
    console.log('✅ Slash commands registered successfully!');
    console.log('📝 Commands registered:');
    commands.forEach(cmd => {
      console.log(`   /${cmd.name} - ${cmd.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
