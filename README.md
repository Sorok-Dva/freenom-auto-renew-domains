<p style="text-align: center; margin: 40px auto;">
  <img src="https://www.freenom.com/images.v2/logo.png" width="150px" /> <b>Auto renew domain</b>
</p>

# Freenom Auto Renew Domains

## Description
This application is a scraper built with puppeteer combined to a discord bot that list your domains, their status and how many days it left before it needs a renew.
This application will also auto renew you free domains when it's possible. (auto renewal is deactivated by default for paid domains, but in a future update you'll be able to manage auto renew with discord commands)

It is highly recommended using this app under a process manager like pm2, as it become a background process that will run on your server.
If you don't have a dedicated server that is always on, consider using [Heroku](https://www.heroku.com/).

## Warning
Due to lack of accessible data on freenom and to avoid unwanted behavior, please be sure at the first start that there is no free domains renewable.

You can take a look here [My Freenoms Domains](https://my.freenom.com/domains.php?a=renewals).

If you have free domain that is renewable please renew it before starting this tool. In this way, 
free domain won't be considered as paid domain and set auto renew to false by default while creating database for the first time.
Of course, for the next launches of the tool, you don't mind about having free domains renewable, the tool will automatically renew it if the first start was execute as described before.

### Prerequisites

- `node` >= 16
- `npm`
- `pm2`

### Quickstart

```
npm install
make .env
pm2 start npm --name FreenomAutoRenewDomains -- run start
```

### Env file

Before running for the first time, you need to fill your `.env` file with your own values.

```dotenv
DB_NAME=freenoms-domains
PUPPETEER_HEADLESS=true

DISCORD_TOKEN=
DISCORD_GUILD_ID=
DISCORD_CHANNEL_ID=

FREENOM_LOGIN=email
FREENOM_PASS=password
FREENOM_CRONJOB="0 9 * * 1"

# Docker exec path
CHROME_PATH=google-chrome-stable
# Linux
CHROME_PATH=/usr/local/bin/chromium
```

- **DB_NAME**: The name of the local sqlite3 db used to saved domain data and preferences (like auto renew)
- **PUPPETEER_HEADLESS**: Display the chromium browser or not
- **CHROME_PATH**: The path to a chromium browser used by puppeteer
- **DISCORD_TOKEN**: The discord bot token *(More info on [Discord.js Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot))*
- **DISCORD_GUILD_ID**: The discord server  *(see [Discord Docs - How to retrieve ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))*
- **DISCORD_CHANNEL_ID**: The discord channel id *(see [Discord Docs - How to retrieve ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))*
- **FREENOM_LOGIN**: Your email of your Freenom account
- **FREENOM_PASS**: Your password of your Freenom account
- **FREENOM_CRONJOB**: The cronjob rule on you want to schedule auto renew. By default, the cronjob rule is set at `09 AM every Monday`. *(More info on [Crontab.guru](https://crontab.guru/))*

### Examples

#### Listing domains with infos
<p style="text-align: center; margin: 20px auto;">
  <img src="/doc/list.png" />
</p>

#### Auto renewal
<p style="text-align: center; margin: 20px auto;">
  <img src="/doc/auto-renew.png" />
</p>
