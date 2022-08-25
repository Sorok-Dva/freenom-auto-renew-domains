const { SlashCommandBuilder } = require('discord.js')
const Freenom = require('../freenom')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-domain')
    .setDescription('Register a new domain trough discord')
    .addStringOption(option => option
      .setName('domain-name')
      .setDescription('Domain to register')
      .setRequired(true)),
  async execute(interaction) {
    console.log(interaction)
    if (Freenom.browser) await Freenom.close()
    await Freenom.init()
    interaction.reply('Retrieving domains...')
  }
}
