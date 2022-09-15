import type { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'
import init, { browser } from '../config/freenom.js'

@Discord()
export class BatchRenew {
  @Slash({
    name: 'batch-renew',
    description: 'Get domains infos & manually execute cronjob'
  })
  async renew(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('Retrieving domains...')
    if (browser) await close()
    await init(interaction.client.guilds, 'renew')
    await interaction.editReply('Batch done.')
  }
}
