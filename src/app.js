/**
 * @Author : Сорок два (https://github.com/Sorok-Dva)
 * @Application : freenom-auto-renew-domains
 * @Description : A scraper built with puppeteer to renew free domains on Freenom and send notification on discord server
 */
require('dotenv').config()
const CronJob = require('cron').CronJob

const Freenom = require('./config/freenom')

const Freenom_job = new CronJob(process.env.FREENOM_CRONJOB, async () => {
  if (Freenom.browser) await Freenom.close()
  await Freenom.init()
})

Freenom_job.start()
