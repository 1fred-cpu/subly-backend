import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables
const databaseUrl = process.env.DATABASE_URL;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: databaseUrl,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL
  },
  synchronize: false, // always false in production
  logging: true, // optional, disable in prod if you prefer
  extra: {
    max: 10, // connection pool size
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
