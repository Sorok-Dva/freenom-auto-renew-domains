import type { Browser, Page } from 'puppeteer'
import { Channel, EmbedBuilder, GuildManager } from 'discord.js'
import puppeteer from 'puppeteer'
import { options as puppeteerOpts } from './puppeteer.js'
import database from '../database.js'

let browser: Browser | null,
  page: Page | null,
  url: string

const close = async () => {
  if (!browser) return true
  await browser.close().then(async () => {
    browser = null
    console.log(`Scrap finished for ${url}`)
  })
}

const setUrl = (type: 'renew' | 'register') => {
  switch(type) {
    case 'renew':
      url = 'https://my.freenom.com/domains.php?a=renewals'
      break
    case 'register':
      url = 'https://my.freenom.com/domains.php'
      break
    default: url = 'https://my.freenom.com/domains.php?a=renewals'
  }
}

const init = async (
  guilds: GuildManager,
  type: 'renew' | 'register',
  args?: { domain: string },
) => {
  try {
    browser = await puppeteer.launch(puppeteerOpts)
    page = await browser.newPage()
    await page.setViewport({ width: 1900, height: 1000, deviceScaleFactor: 1 })
    await page.goto('https://my.freenom.com/clientarea.php', { waitUntil: 'networkidle2' })
    
    const title = await page.title()
    console.log(title)
  
    const guild = await guilds.fetch(String(process.env.DISCORD_GUILD_ID))
    const channel = await guild.channels.fetch(String(process.env.DISCORD_CHANNEL_ID))
    if(!channel) throw new Error('Channel not found. Please check guild & channel id')
  
    setUrl(type)
    await login()
    if (type === 'renew') await renewFreeDomains(channel)
    if (type === 'register') await registerDomain(channel, args!.domain)
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
    await page.waitForXPath('//a[contains(text(), "Logout")]').catch((e: Error) => {
      throw new Error(`Login Details Incorrect. Please check your .env file. (${e.message})`)
    })
    console.log('connected')
  } catch (e) {
    console.error('[login]', e)
    await close()
  }
}

const renewFreeDomains = async (channel: Channel) => {
  try {
    if (!page) return
    await page.goto(url, { waitUntil: 'networkidle2' })
  
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

const registerDomain = async (
  channel: Channel,
  domain: string,
) => {
  try {
    if (!page) return
    const messageEmbed = new EmbedBuilder()
      .setTitle('Register a new freenom domain')
      .setColor(5763719)
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page
      .type('input[name="domainname"]', domain, { delay: 35 })
      .then(async () => console.log('Domain complete'))
    await page.keyboard.press('Enter')
    await page.waitForSelector('.selectedDomains', {
      visible: true,
    })
    const hasError = await page.evaluate(() =>
        // @ts-ignore
      document.getElementsByClassName('alert')[0].style.display !== 'none'
    )
    const hasSuccess = await page.evaluate(() =>
      // @ts-ignore
      document.getElementsByClassName('succes')[0].style.display !== 'none'
    )
    
    console.log(hasError, hasSuccess)
    messageEmbed.addFields({ name: 'Result', value: hasSuccess ? 'Available' : 'Not available' })
    if(channel?.isTextBased()){
      channel.send({ embeds: [messageEmbed] })
    }
  } catch (e) {
    console.error('[register] Error', e)
    await close()
  }
}

export default init

export {
  browser,
  close,
}
