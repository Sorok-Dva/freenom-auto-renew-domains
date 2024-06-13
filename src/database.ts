import sqlite3, { Database, RunResult } from 'sqlite3';
import { dirname } from '@discordx/importer'
import * as fs from 'fs'
import * as util from 'util'

type PromisifiedDatabase = Database & {
  runAsync: (sql: string, ...params: any[]) => Promise<RunResult>,
  getAsync: (sql: string, ...params: any[]) => Promise<any>,
  allAsync: (sql: string, ...params: any[]) => Promise<any[]>
};

const instance = new sqlite3.Database(`./${process.env.DB_NAME}.db`,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error(err.message)
    console.log(`Connected to the ${process.env.DB_NAME} database.`)
    
    create()
  }) as PromisifiedDatabase;

instance.runAsync = util.promisify(instance.run)
instance.getAsync = util.promisify(instance.get)
instance.allAsync = util.promisify(instance.all)

const create = (): void => {
  const migrations = fs.readdirSync(dirname(import.meta.url) + '/db/migrations/')
    .filter(file => file.endsWith('.sql'))
  
  for (const file of migrations) {
    console.log('CREATE', file)
    const migration = fs.readFileSync(`${dirname(import.meta.url)}/db/migrations/${file}`).toString()
    instance.exec(migration)
  }
}

export default instance
