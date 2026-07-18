import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

// This file is used by the TypeORM CLI only (migrations)
// It is NOT used by the NestJS app at runtime (app.module.ts handles that)

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // Previously { rejectUnauthorized: false } — disabled TLS certificate
  // validation in production. See app.module.ts for the matching fix.
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false,

  // entity files
  entities: [join(__dirname, 'modules/**/entities/*.entity.{ts,js}')],

  // migration files
  migrations: [join(__dirname, '..', 'migrations/*.{ts,js}')],

  // NEVER set synchronize true here — migrations only
  synchronize: false,

  logging: true,
});