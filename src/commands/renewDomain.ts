import type { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'
import init, { browser } from '../config/freenom'

@Discord()
export class BatchRenew {
  @Slash({
    name: 'renew-domain',
    description: 'Renew a specific domain'
  })
  async renew(interaction: CommandInteraction): Promise<void> {
  }
}
