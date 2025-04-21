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
} from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'node:url';
import { FileInterceptor } from '@nestjs/platform-express';
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
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/assets/audio',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `music-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  upload(
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trackService.create(createTrackDto, file);
  }
}
