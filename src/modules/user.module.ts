import { TrackModule } from './track.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';
import { MyElasticsearchModule } from 'src/elasticsearch/myelasticsearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MyElasticsearchModule,
    TrackModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
