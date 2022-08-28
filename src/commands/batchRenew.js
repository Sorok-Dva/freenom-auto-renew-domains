const { SlashCommandBuilder } = require('discord.js')
const Freenom = require('../freenom')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('batch-renew')
    .setDescription('Get domains infos & execute a batch renewal'),

  async execute(interaction) {
    interaction.reply('Retrieving domains...')
    if (Freenom.browser) await Freenom.close()
    await Freenom.init()
  }
}
