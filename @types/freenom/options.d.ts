declare module '@freenom/discord-bot' {
  import { Config } from '@freenom/discord-bot'
  import { WebSocketOptions, WSEventType, HTTPOptions } from 'discord.js'

  export type ClientOptions = {
    apiRequestMethod?: string
    shardId?: number
    shardCount?: number
    messageCacheMaxSize?: number
    messageCacheLifetime?: number
    messageSweepInterval?: number
    fetchAllMembers?: boolean
    disableEveryone?: boolean
    sync?: boolean
    restWsBridgeTimeout?: number
    restTimeOffset?: number
    retryLimit?: number
    disabledEvents?: WSEventType[]
    ws?: WebSocketOptions
    http?: HTTPOptions
  }

  export type BotOptions = ClientOptions & Config & {
    commandEditableDuration?: number
    nonCommandEditable?: boolean
    invite?: string
  }
}
