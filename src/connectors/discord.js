const discord = {
  hookId: '',
  hookToken: '',
  userName: '',
  avatarUrl: '',
  sendMessage: function (msg) {
    let request = require('request')
    let fs = require('fs')

    let formData = {
      'content': msg,
      'username': this.userName,
      'avatar_url': this.avatarUrl,
    }

    let options = {
      port: 443,
      url: 'https://discordapp.com/api/webhooks/' + this.hookId + '/' + this.hookToken,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      formData
    }

    return new Promise(() => {
      request(options, function (error, response) {
        if (error) throw new Error(error)
        console.log(response.body)
      })
    })
  }
}

module.exports = async (text, file) => {
  discord.hookId = process.env.DISCORD_WEBHOOK_ID
  discord.hookToken = process.env.DISCORD_WEBHOOK_TOKEN
  await discord.sendMessage(text, file)
}
