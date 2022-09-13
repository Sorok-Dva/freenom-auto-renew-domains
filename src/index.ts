/**
 * @Author : Сорок два (https://github.com/Sorok-Dva)
 * @Application : freenom-auto-renew-domains
 * @Description : A scraper built with puppeteer & discord bot to renew free domains on Freenom
 * */
import 'reflect-metadata'
import 'dotenv/config'

import type { Interaction, Message } from 'discord.js'
import { CronJob } from 'cron'
import { dirname, importx } from '@discordx/importer'

import init, { browser, close } from './config/freenom.js'
import bot from './bot.js'

bot.once('ready', async () => {
  await bot.guilds.fetch()
  await bot.initApplicationCommands()
  
  console.log('Freenom bot successfully started')
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

bot.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return
  await bot.executeCommand(message)
})

const run = async () => {
  await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}')
  
  if (!process.env.DISCORD_BOT_TOKEN) throw Error('Could not find BOT_TOKEN in your environment')
  await bot.login(process.env.DISCORD_BOT_TOKEN)
}

(async (): Promise<void> => {
  try {
    await run()
    new CronJob(String(process.env.FREENOM_CRONJOB), async () => {
      if (browser) await close()
      await init(bot.guilds)
    }).start()
  } catch (e) {
    console.log('Error while starting Freenom Bot', e)
  }
})()
