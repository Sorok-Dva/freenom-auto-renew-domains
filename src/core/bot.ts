import BotClient from './client'

/**
 *  Ignition of the discord bot with variables set in .env
 *
 * @name bot
 * @module core
 * @returns BotClient
 * */
const bot = new BotClient({
  token: <string>process.env.TOKEN,
  env: 'dev',
})

export default bot
