import { PuppeteerNodeLaunchOptions } from 'puppeteer'

const options: PuppeteerNodeLaunchOptions = {
  headless: false,
  executablePath: process.env.CHROME_PATH,
  ignoreDefaultArgs: ['--disable-extensions'],
  args: [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-zygote',
  ],
}

export {
  options,
}
