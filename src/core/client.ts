import type {
  BotOptions,
} from '@freenom/discord-bot'
import {
  Client,
  GatewayIntentBits,
  Collection,
  Routes,
  Interaction,
} from 'discord.js'
import { REST } from '@discordjs/rest'
import fs from 'fs'
import { errors } from '.'

const commands: Array<string> = []
const commandFiles = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'))

const clientId = String(process.env.DISCORD_CLIENT_ID)
const guildId = String(process.env.DISCORD_GUILD_ID)

/**
 * Bot Client Class that retrieve djs collections after login and listen events
 *
 * @class
 * */
export default class BotClient extends Client {
  /* BotOptions that contains token */
  private readonly config: BotOptions
  
  /* The Discord.js Client Object */
  public client: Client
  
  constructor (config: BotOptions) {
    super({
      intents: [GatewayIntentBits.Guilds]
    })
    console.log('starting bot initialization...')
    this.config = config
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds]
    })
  }
  
  /**
   * Discord start method that should be used after the initialization of this interface to start the bot
   *
   * @function
   *
   * @returns Promise<this>
   * */
  public async start (): Promise<this> {
    this.client.commands = new Collection()
  
    for (const file of commandFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(`./commands/${file}`)
      commands.push(command.data.toJSON());
    
      this.client.commands.set(command.data.name, command)
    }
    this.client.once('ready', this.ready)
    this.client.on('error', console.error)
    this.client.on('reconnecting', () => console.log('Reconnecting ...'))
    this.client.on('disconnect', () => console.warn('Disconnected'))
    this.client.on('shardDisconnect', () => console.warn('shardDisconnect'))
    this.client.on('shardError', () => console.warn('shardError'))
    this.client.on('interactionCreate', interaction => this.interact(interaction))
    
    await this.client.login(this.config.token)
    return this
  }
  
  /**
   * Discord ready event
   *
   * @function
   *
   * @returns this
   * */
  public async ready (): Promise<any> {
    console.log(`Bot ready as ${this.user?.username}`)
    const rest = new REST({ version: '10' }).setToken(<string>process.env.DISCORD_BOT_TOKEN)
  
    ;await (async () => {
      try {
        console.log('Started refreshing application (/) commands.');
      
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId) as unknown as `/${string}`,
          { body: commands },
        );
      
        console.log('Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
      }
    })()
    
    return this
  }

  /**
   * Discord interaction (/ command) event
   *
   * @function
   *
   * @returns Promise<void>
   * */
  public async interact (
    interaction: Interaction,
  ): Promise<void> {
    try {
      if (!interaction.isCommand()) return
      const command = this.client.commands.get(interaction.commandName)
      if (!command) return
      try {
        await command.execute(interaction)
      } catch (error) {
        if (error) console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command !', ephemeral: true })
      }
    } catch (err: any) {
      errors.raiseReply(err, interaction)
    }
  }
}

