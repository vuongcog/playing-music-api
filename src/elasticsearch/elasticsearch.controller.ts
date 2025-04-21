import { Controller, Post } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Controller('elasticsearch')
export class ElasticsearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Post('create-index')
  async createIndex() {
    const indexName = 'users'; // Index name
    await this.elasticsearchService.createIndex(indexName);
    return { message: 'Index created successfully' };
  }

  @Post('add-document')
  async addDocument() {
    const indexName = 'users'; // Index name
    const document = {
      id: 'u001',
      name: 'Nguyễn Văn A',
      email: 'vana@example.com',
    };

    await this.elasticsearchService.addDocument(indexName, 'u001', document);
    return { message: 'Document added successfully' };
  }
}
