import { CacheType, EmbedBuilder, Interaction, Message } from 'discord.js'

export default {
  /**
   * raiseReply is use to reply an embed error to a user message
   *
   * @function
   *
   * @returns void
   * */
  raiseReply: (error: string, interaction: Interaction<CacheType>): void => {
    const embed = new EmbedBuilder()
      .setTitle('Error')
      .setColor(0xFF0000)
      .setDescription(`An error has occurred : ${error}`)
      .setTimestamp()
  
    interaction.reply({ embeds: [embed] }).then(async m => {
      await m.delete()
      setTimeout(() => m.delete(), 15000)
    })
  },
  
  /**
   * raise error outside bot interface, it will print a console.error into terminal
   *
   * @param error - Self-explanatory
   *
   * @returns void
   */
  log: (error: Error | string): void => console.error(error),
}
