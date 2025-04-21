import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';
import { CreateUserDTO } from './../dto/user/create-user';
import {
  Get,
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UpdateUserDTO } from 'src/dto/user/update-user';
import { User } from 'src/entities/user.entity';
import type { Repository } from 'typeorm';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {}

  async getAllUsersFromIndex() {
    try {
      const result = await this.elasticsearchService.getClient().search({
        index: 'users',
        body: {
          query: {
            match_all: {}, // Truy vấn tất cả các document trong index
          },
        } as any,
      });

      console.log('Documents in index users:', result.hits.hits); // Đảm bảo sử dụng đúng thuộc tính
      return result.hits.hits; // Trả về danh sách các document
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async create(dto: CreateUserDTO) {
    const user = this.repo.create(dto);
    const savedUser = await this.repo.save(user);
    return savedUser;
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDTO) {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async findByUserNameForRegister(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findByUserName(username: string): Promise<User> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }
}
