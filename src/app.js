/**
 * @Author : Сорок два (https://github.com/Sorok-Dva)
 * @Application : freenom-auto-renew-domains
 * @Description : A scraper built with puppeteer to renew free domains on Freenom and send notification on discord server
 */
require('dotenv').config()
const CronJob = require('cron').CronJob
const { REST } = require('@discordjs/rest')
const {
  Client,
  GatewayIntentBits,
  Collection,
  Routes,
} = require('discord.js');
const fs = require('node:fs')

const commands = []
const commandFiles = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'))

const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID
// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})
// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON());

  client.commands.set(command.data.name, command);
}

// When the client is ready, this only runs once
client.once('ready', () => {
  console.log('Discord bot id Ready !')
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN)

  ;(async () => {
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    if (error) console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN)

const Freenom = require('./freenom')

const Freenom_job = new CronJob(process.env.FREENOM_CRONJOB, async () => {
  if (Freenom.browser) await Freenom.close()
  await Freenom.init()
})

Freenom_job.start()
