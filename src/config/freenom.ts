import type { Browser, Page } from 'puppeteer'
import { CommandInteraction, EmbedBuilder, GuildManager } from 'discord.js'
import { Client } from 'discordx'
import puppeteer from 'puppeteer'
import { options as puppeteerOpts } from './puppeteer.js'
import database from '../database.js'

let browser: Browser | null,
  page: Page | null,
  url = 'https://my.freenom.com/domains.php?a=renewals'

const close = async () => {
  if (!browser) return true
  await browser.close().then(async () => {
    browser = null
    console.log(`Scrap finished for ${url}`)
  })
}

const init = async (guilds: GuildManager) => {
  try {
    browser = await puppeteer.launch(puppeteerOpts)
    page = await browser.newPage()
    await page.setViewport({ width: 1900, height: 1000, deviceScaleFactor: 1 })
    
    await page.goto(url, { waitUntil: 'networkidle2' })
    
    const title = await page.title()
    console.log(title)
    
    await login()
    await renewFreeDomains(guilds)
  } catch (e) {
    console.error('[INIT] Failed', e)
  } finally {
    await close()
  }
}

const getDomain = async (name: string) => await database.get('SELECT * FROM freenom WHERE name = ?', [name])

const login = async () => {
  try {
    if (!page) return
    await page
      .type('input[name="username"]', String(process.env.FREENOM_LOGIN), { delay: 35 })
      .then(async () => console.log('Username complete'))
    await page.waitForTimeout(500)
    await page
      .type('input[name="password"]', String(process.env.FREENOM_PASS), { delay: 35 })
      .then(async () => console.log('Password complete'))
    await page.evaluate(() => document.getElementsByTagName('form')[0].submit())
    await page.waitForSelector('.renewalContent').catch((e: Error) => {
      throw new Error(`Login Details Incorrect. Please check your .env file. (${e.message})`)
    })
    console.log('connected')
  } catch (e) {
    console.error('[login]', e)
    await close()
  }
}

const renewFreeDomains = async (guilds: GuildManager) => {
  try {
    if (!page) return
    const guild = await guilds.fetch(String(process.env.DISCORD_GUILD_ID))
    const channel = await guild.channels.fetch(String(process.env.DISCORD_CHANNEL_ID))
  
    if(!channel) throw new Error('Channel not found. Please check guild & channel id')
    
    const domains = await page.evaluate(() => {
      let domains: {
        name: string
        status: string
        expires: string
        renewable: boolean
        renewLink: string
      }[] = []
      for (let i = 0; i < document.getElementsByTagName('tbody')[0].children.length; i++) {
        domains.push({
          /* @ts-ignore */
          name: document.getElementsByTagName('tbody')[0].children[i].childNodes[0].innerText,
          /* @ts-ignore */
          status: document.getElementsByTagName('tbody')[0].children[i].childNodes[1].innerText,
          /* @ts-ignore */
          expires: document.getElementsByTagName('tbody')[0].children[i].childNodes[2].innerText,
          /* @ts-ignore */
          renewable: document.getElementsByTagName('tbody')[0].children[i].childNodes[3].innerText === 'Renewable',
          /* @ts-ignore */
          renewLink: document.getElementsByTagName('tbody')[0].children[i].childNodes[5].childNodes[0].href,
        })
      }
      
      return domains
    })
    
    const messageEmbed = new EmbedBuilder()
      .setTitle('Freenoms domains')
      .setColor(1146986)
    
    let message: string = ``
    let messages: string[] = []
    let i = 1
    await Promise.all(domains.map(async domain => {
      const id = domain.renewLink.replace('https://my.freenom.com/domains.php?a=renewdomain&domain=', '')
      const daysLeft = parseInt(domain.expires.replace(' Days', ''))
      // this condition may return false positive, due to lake of data on freenom,
      // the false positive can occurs in the case where a free domain in renewable,
      // that's why the scrapper should be run a first time without any free domains renewables
      // (in this way the free domain state will be saved in db)
      const freeDomain = (daysLeft > 14 && !domain.renewable)
      let row: any = await getDomain(domain.name)
      
      if (row === undefined) {
        await database.run(`INSERT INTO freenom
          (id, name, status, free, autoRenew) VALUES(?, ?, ?, ?, ?)`,
          [id, domain.name, domain.status, freeDomain, freeDomain],
        )
        row = await getDomain(domain.name)
      }
      
      message += `- **${domain.name}** _(${row.free ? 'free' : 'paid'})_: **${daysLeft}** days left.\n  Auto renewal is ${row.autoRenew === 1 ? '**enabled**.' : '**disabled**.'} ${daysLeft < 14 && row.free && row.autoRenew ? 'Starting auto renewal.' : ''}\n\n`
      messageEmbed.addFields({
        name: `**${domain.name}** _(${row.free ? 'free' : 'paid'})_: **${daysLeft}** days left.`,
        value: `Auto renewal is ${row.autoRenew === 1 ? '**enabled**.' : '**disabled**.'} ${daysLeft < 14 && row.free && row.autoRenew ? 'Starting auto renewal.' : ''}`
      })
      if (daysLeft < 14 && row.free && row.autoRenew) {
        if (!page) return
        await page.goto(domain.renewLink, {waitUntil: 'networkidle2'})
        await page.waitForSelector('.renewDomains')
        await page.evaluate(() => document.getElementsByTagName('option')[11].selected = true)
        await page.evaluate(() => document.getElementsByTagName('form')[0].submit())
        await page.waitForSelector('.completedOrder').catch(async () => {
          message += `**[${domain.name}]** An error has occurred while trying to auto renew this domain`
          messageEmbed.addFields({
            name: `**[${domain.name}]**`,
            value: `An error has occurred while trying to auto renew this domain`
          })
        })
        message += `**[${domain.name}]** Auto renewal complete !`
        messageEmbed.addFields({
          name: `**[${domain.name}]**`,
          value: `Auto renewal complete !`
        })
      }
      messages.push(message)
      message = ''
      
      if (i === domains.length) {
        const message = messages.join().replace(/,-/g, '-')
        console.log('message: ', message)
        if(channel?.isTextBased()){
          channel.send({ embeds: [messageEmbed] })
        }
      }
      i += 1
    }))
  } catch (e) {
    console.error('[renew] Error', e)
    await close()
  }
}

export default init

export {
  browser,
  close,
}
