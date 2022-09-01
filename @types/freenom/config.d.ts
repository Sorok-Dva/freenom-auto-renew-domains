declare module '@freenom/discord-bot' {
  /**
   * Discord Bot Command Config Interface
   *
   * @interface
   */
  export interface Config {
    /* Environment of the discord bot */
    env: 'dev' | 'live'
    
    /* Discord bot token */
    token: string
  }
}
