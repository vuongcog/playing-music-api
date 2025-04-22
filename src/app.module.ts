import { UserService } from './services/user.service';
import { AuthController } from './auth/auth.controller';
import { TrackModule } from './modules/track.module';
import { AppDataSource } from './data-source';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserModule } from './modules/user.module';
import { TrackService } from './services/track.service';
import { TrackController } from './controllers/track.controller';
import { Track } from './entities/track';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { ElasticsearchService } from './elasticsearch/elasticsearch.service';
import { MyElasticsearchModule } from './elasticsearch/myelasticsearch.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'assets'), // Đường dẫn thư mục gốc chứa assets
      serveRoot: '/src/assets', // Đường dẫn URL mà bạn sẽ truy cập
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'huynhnhatvuong1',
      database: 'playing_music',
      entities: [User, Track],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([User, Track]),
    UserModule,
    TrackModule,
    AuthModule,
    MyElasticsearchModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
