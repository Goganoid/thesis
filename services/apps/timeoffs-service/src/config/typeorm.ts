import { SnakeNamingStrategy } from '@app/shared/typeorm/snake-naming.strategy';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST}`,
  port: +process.env.POSTGRES_PORT!,
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DATABASE}`,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
