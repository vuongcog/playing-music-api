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

  async create(dto: CreateTrackDto, file: Express.Multer.File): Promise<Track> {
    const filePath = join(
      __dirname,
      '../..',
      'src/assets/audio',
      file.filename,
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
        fileUrl: `/uploads/${file.filename}`,
      });

      return await this.trackRepository.save(track);
    } catch (err) {
      await unlink(filePath);
      throw err;
    }
  }

  findAll() {
    return this.trackRepository.find();
  }

  async findOne(id: string) {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async update(id: string, dto: UpdateTrackDto) {
    const track = await this.findOne(id);
    Object.assign(track, dto);
    return this.trackRepository.save(track);
  }

  async remove(id: string) {
    const track = await this.findOne(id);
    return this.trackRepository.remove(track);
  }
}
