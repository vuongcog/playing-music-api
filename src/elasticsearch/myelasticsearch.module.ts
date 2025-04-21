import { ElasticsearchService } from './elasticsearch.service';
import { Module } from '@nestjs/common';
import { ElasticsearchController } from './elasticsearch.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [ElasticsearchModule.register({ node: 'http:/localhost:9200' })],
  controllers: [ElasticsearchController],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService, ElasticsearchModule],
})
export class MyElasticsearchModule {}
