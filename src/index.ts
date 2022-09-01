/**
 * @Author : Сорок два (https://github.com/Sorok-Dva)
 * @Application : freenom-auto-renew-domains
 * @Description : A scraper built with puppeteer & discord bot to renew free domains on Freenom
 * */
import 'dotenv/config'

import { CronJob } from 'cron'
import { Bot } from './core'
import { freenom } from './config/freenom'

(async (): Promise<void> => {
  try {
    await Bot.start()
    new CronJob(String(process.env.FREENOM_CRONJOB), async () => {
      if (freenom.browser) await freenom.close()
      await freenom.init()
    }).start()
  } catch (e) {
    console.log('Error while starting Freenom Bot', e)
  }
})()
