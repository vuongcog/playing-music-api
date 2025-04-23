import { Track } from './../entities/track.entity';
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
import { TrackService } from './track.service';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly trackService: TrackService, // Sử dụng TrackService thay vì TrackRepository
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

  async getLikedTracks(userId: string): Promise<Track[]> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['likedTracks'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user.likedTracks;
  }

  async addTrackToLiked(
    userId: string,
    trackId: string,
  ): Promise<{ message: string; likedTracks: any[] }> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['likedTracks'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const track = await this.trackService.findOne(trackId);

    if (!track) {
      throw new Error('Track not found');
    }

    user.likedTracks.push(track);
    await this.repo.save(user);

    return {
      message: 'Track added to liked tracks successfully',
      likedTracks: user.likedTracks,
    };
  }

  async removeTrackFromLiked(
    userId: string,
    trackId: string,
  ): Promise<{ message: string; removedTrack: any }> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['likedTracks'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const trackToRemove = user.likedTracks.find(
      (track) => track.id === trackId,
    );
    if (!trackToRemove) {
      throw new Error('Track not found in liked tracks');
    }

    user.likedTracks = user.likedTracks.filter((track) => track.id !== trackId);
    await this.repo.save(user);

    return {
      message: 'Track deleted successfully',
      removedTrack: trackToRemove,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
    });
  }
}
