import { Response, Express } from 'express';
import { console } from 'node:inspector/promises';
import { UpdateTrackDto } from './../dto/track/update-track.dto';
import { CreateTrackDto } from './../dto/track/create-track.dto';
import { TrackService } from './../services/track.service';
import {
  Body,
  Controller,
  Post,
  Param,
  Patch,
  Delete,
  Get,
  Res,
  Headers,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'node:url';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { extname } from 'node:path';
@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // @Post()
  // create(@Body() dto: CreateTrackDto) {
  //   console.log('Dữ liệu trả về là ');
  //   console.log(dto);
  //   return this.trackService.create(dto);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackService.findOne(id);
  }

  @Get()
  findAall() {
    return this.trackService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.trackService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackService.remove(id);
  }

  @Get('stream/:filename')
  streamAudio(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Headers('range') range?: string,
  ) {
    const filePath = path.join(
      'D:\\project\\javascript\\playing_music\\playing_music\\src\\',
      'assets\\audio\\',
      filename,
    );

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).send('Requested Range Not Satisfiable');
      return;
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    });

    stream.pipe(res);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const dest =
              file.fieldname === 'image'
                ? './src/assets/images'
                : './src/assets/audio';
            cb(null, dest);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const prefix = file.fieldname === 'image' ? 'image' : 'music';
            cb(null, `${prefix}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  async upload(
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    // Kiểm tra file audio
    if (!files.audio || files.audio.length === 0) {
      throw new BadRequestException('Thiếu file nhạc');
    }

    // Kiểm tra file ảnh (tùy chọn bạn có thể bắt buộc hoặc không)
    if (!files.image || files.image.length === 0) {
      throw new BadRequestException('Thiếu file ảnh');
    }

    const audioFile = files.audio[0];
    const imageFile = files.image[0];

    return this.trackService.create(createTrackDto, audioFile, imageFile);
  }
}
