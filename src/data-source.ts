import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Track } from './entities/track';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'huynhnhatvuong1',
  database: 'playing_music',
  entities: [User, Track],
  synchronize: true,
  logging: true,
  migrations: ['src/migrations/*.ts'],
});
