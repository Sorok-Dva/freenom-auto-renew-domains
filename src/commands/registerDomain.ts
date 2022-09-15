import type { CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import init from '../config/freenom.js'

@Discord()
export class RegisterDomain {
  @Slash({
    name: 'register-domain',
    description: 'Register a new domain trough discord'
  })
  async register(
    @SlashOption({ description: 'Domain name', name: 'domain' })
      domain: string,
    interaction: CommandInteraction
  ): Promise<void> {
    try {
      console.log(domain)
      await interaction.reply('Registration of new domain')
      await init(interaction.client.guilds, 'register', { domain })
  
      await interaction.editReply('New domain successfully registered.')
    } catch (e) {
      await interaction.editReply('Error while trying to register domain')
    }
  }
}
