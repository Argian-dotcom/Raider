const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const axios = require('axios');

// ------------------ ENVIRONMENT VARIABLES ------------------
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://your-app.onrender.com/callback';

if (!TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Missing TOKEN, CLIENT_ID, or CLIENT_SECRET in environment variables.");
    process.exit(1);
}

// ------------------ DISCORD BOT SETUP ------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`🤖 Bot Name: Lunar Raider`);
    console.log(`📝 Description: raid bot`);

    // Register slash commands globally
    const commands = [
        new SlashCommandBuilder()
            .setName('raid')
            .setDescription('Spam a message in this channel')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message to repeat')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('count')
                    .setDescription('Number of times to repeat (max 20)')
                    .setRequired(false))
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Registering global slash commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Successfully registered slash commands!');
    } catch (error) {
        console.error(error);
    }
});

// ------------------ SLASH COMMAND HANDLER ------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'raid') {
        const message = interaction.options.getString('message');
        let count = interaction.options.getInteger('count') || 5;
        if (count > 20) count = 20;
        if (count < 1) count = 1;

        await interaction.reply({ content: `🚀 Starting spam of **${count}** messages...`, ephemeral: true });

        for (let i = 0; i < count; i++) {
            await interaction.channel.send(message);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await interaction.followUp({ content: `✅ Finished spamming ${count} messages.`, ephemeral: true });
    }
});

client.login(TOKEN);

// ------------------ EXPRESS SERVER FOR OAuth2 ------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Simple landing page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h1>🤖 Lunar Raider</h1>
            <p>Click below to authorize this bot for your server</p>
            <a href="/auth">➡️ Authorize Bot</a>
        </body>
        </html>
    `);
});

// Step 1: Redirect user to Discord to authorize and pick a server
app.get('/auth', (req, res) => {
    const authURL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join%20bot&permissions=2048`;
    // Permissions: 2048 = Send Messages
    res.redirect(authURL);
});

// Step 2: Discord redirects back here with a temporary code
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('❌ No code provided.');

    try {
        // Exchange code for an access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const accessToken = tokenResponse.data.access_token;

        // Fetch user's guilds where they have 'Manage Server' permission
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const guilds = guildsResponse.data;

        let html = `<html><body><h1>✅ Authorization Successful!</h1><p>Choose a server to add Lunar Raider:</p><ul>`;
        for (const guild of guilds) {
            // Check if user has admin or manage server permissions (0x20 = Manage Server)
            if ((guild.permissions & 0x20) === 0x20) {
                html += `<li><a href="/add-bot?guild_id=${guild.id}">${guild.name}</a></li>`;
            }
        }
        html += `</ul></body></html>`;
        res.send(html);
    } catch (error) {
        console.error(error);
        res.send('❌ An error occurred during authorization.');
    }
});

// Step 3: Add the bot to the selected guild
app.get('/add-bot', async (req, res) => {
    const guildId = req.query.guild_id;
    if (!guildId) return res.send('❌ No guild ID provided.');

    // Generate a direct invite link for the bot
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=2048&scope=bot&guild_id=${guildId}`;
    res.send(`
        <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h1>🤖 Add Lunar Raider</h1>
            <p>Click below to add the bot to your selected server:</p>
            <a href="${inviteLink}" target="_blank">➕ Click Here to Add Bot</a>
            <p>After adding, go to any channel and use <strong>/raid</strong> command!</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 OAuth web server running on port ${PORT}`);
});
