import { Client } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: 'http://localhost:9200',
      headers: {
        accept: 'application/vnd.elasticsearch+json;compatible-with=8',
        'content-type': 'application/vnd.elasticsearch+json;compatible-with=8',
      },
    });
  }

  async createIndex(indexName: string) {
    const exists = await this.client.indices.exists({ index: indexName });
    if (!exists) {
      const result = await this.client.indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            email: { type: 'keyword' },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
      });
      console.log('Index created:', result);
      return result;
    } else {
      console.log('Index already exists');
      return null;
    }
  }

  async addDocument(indexName: string, id: string, document: any) {
    try {
      const result = await this.client.index({
        index: indexName,
        id: id,
        body: document, // Đây là dữ liệu document cần thêm
      });
      console.log('Document added:', result);
      return result;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
