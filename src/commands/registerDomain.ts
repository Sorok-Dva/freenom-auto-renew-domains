import type { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class BatchRenew {
  @Slash({
    name: 'register-domain',
    description: 'Register a new domain trough discord'
  })
  async register(interaction: CommandInteraction): Promise<void> {
  }
}
