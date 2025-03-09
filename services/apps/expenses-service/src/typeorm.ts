import { SnakeNamingStrategy } from '@app/shared/typeorm/snake-naming.strategy';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

console.log('Entities', join(__dirname, '/**/*.entity{.ts,.js}'));

const config: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.EXPENSES_SERVICE_POSTGRES_HOST}`,
  port: +process.env.EXPENSES_SERVICE_POSTGRES_PORT!,
  username: `${process.env.EXPENSES_SERVICE_POSTGRES_USER}`,
  password: `${process.env.EXPENSES_SERVICE_POSTGRES_PASSWORD}`,
  database: `${process.env.EXPENSES_SERVICE_POSTGRES_DATABASE}`,
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
