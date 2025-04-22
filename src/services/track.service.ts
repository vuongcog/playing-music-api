import { CreateTrackDto } from './../dto/track/create-track.dto';
import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import { console } from 'node:inspector/promises';
import { join } from 'node:path';
import type { UpdateTrackDto } from 'src/dto/track/update-track.dto';
import { Track } from 'src/entities/track';
import type { Repository } from 'typeorm';

import * as mm from 'music-metadata';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  async create(
    dto: CreateTrackDto,
    audioFile: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Track> {
    const filePath = join(
      __dirname,
      '../..',
      'src/assets/audio',
      audioFile.filename,
    );

    try {
      const metadata = await mm.parseFile(filePath);
      const rawDuration = metadata.format.duration;

      if (typeof rawDuration !== 'number') {
        throw new Error('Không lấy được duration từ file nhạc');
      }

      const duration = Math.round(rawDuration);

      const track = this.trackRepository.create({
        ...dto,
        duration,
        fileUrl: audioFile.filename,
        imageUrl: imageFile?.filename,
      });

      return await this.trackRepository.save(track);
    } catch (err) {
      await unlink(filePath);
      throw err;
    }
  }

  async findAll({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page: number;
    limit: number;
    search: string;
  }) {
    const take = limit;
    const skip = (page - 1) * take;

    const query = this.trackRepository
      .createQueryBuilder('track')
      .orderBy('track.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (search) {
      query.where(
        'LOWER(track.title) LIKE :search OR LOWER(track.artist) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / take);

    return { data, totalPages };
  }

  async findOne(id: string) {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async update(
    id: string, // → string
    dto: UpdateTrackDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Track> {
    // Tìm theo UUID string
    const track = await this.trackRepository.findOneBy({ id });
    if (!track) {
      throw new NotFoundException('Không tìm thấy track');
    }

    // Xử lý file audio mới (nếu có)
    if (audioFile) {
      const newAudioPath = join(
        __dirname,
        '../..',
        'src/assets/audio',
        audioFile.filename,
      );
      const metadata = await mm.parseFile(newAudioPath);
      const rawDuration = metadata.format.duration;
      track.duration =
        typeof rawDuration === 'number'
          ? Math.round(rawDuration)
          : track.duration;

      if (track.fileUrl) {
        const oldAudio = join(
          __dirname,
          '../..',
          'src/assets/audio',
          track.fileUrl,
        );
        unlink(oldAudio).catch(() => null);
      }
      track.fileUrl = audioFile.filename;
    }

    if (imageFile) {
      if (track.imageUrl) {
        const oldImage = join(
          __dirname,
          '../..',
          'src/assets/images',
          track.imageUrl,
        );
        unlink(oldImage).catch(() => null);
      }
      track.imageUrl = imageFile.filename;
    }

    if (dto.title !== undefined) track.title = dto.title;
    if (dto.artist !== undefined) track.artist = dto.artist;
    if (dto.album !== undefined) track.album = dto.album;
    if (dto.genre !== undefined) track.genre = dto.genre;

    return this.trackRepository.save(track);
  }
  async remove(id: string) {
    const track = await this.findOne(id);
    return this.trackRepository.remove(track);
  }
}
