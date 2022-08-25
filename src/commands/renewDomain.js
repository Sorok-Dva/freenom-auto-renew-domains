const { SlashCommandBuilder } = require('discord.js')
const Freenom = require('../freenom')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('renew-domain')
    .setDescription('Renew a specific domain')
    .addStringOption(option => option
      .setName('domain-name')
      .setDescription('Domain to renew')
      .setRequired(true)),
  async execute(interaction) {
    const domain = interaction.options.getString('domain-name')
    interaction.reply(`Trying to renew \`${domain}\``)
    try {
      if (Freenom.browser) await Freenom.close()
      await Freenom.initPage('https://my.freenom.com/clientarea.php')
      await Freenom.login()
      const domainData = await Freenom.getDbDomain(domain)
      console.log(domainData)
      if (!domainData || !domainData.id) await interaction.editReply('Unable to retrieve domain data in database. Please run `batch-renew` command before using `renew-domain`');
    } catch (e) {
      console.error('[/renewDomain]', e)
    }
  }
}
