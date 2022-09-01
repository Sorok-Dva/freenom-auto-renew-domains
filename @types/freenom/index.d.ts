import type {
  Browser,
  Page
} from 'puppeteer'
import { Database } from 'sqlite3'

declare module '@freenom/discord-bot' {
  /**
   * Freenom Interface
   *
   * @interface
   */
  export interface Freenom {
    browser: Browser | null
    page: Page | null
    url: string
    db: Database
    getDomain: (name: string) => Promise<sqlite.Database>
    close: () => Promise<true | undefined>
    init: () => Promise<void>
    login: () => Promise<void>
    renewFreeDomains: () => Promise<void>
  }
}

