module.exports = {
  options: {
    headless: true,
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
  },
}
