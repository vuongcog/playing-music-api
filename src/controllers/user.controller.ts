import { console } from 'node:inspector/promises';
import { ElasticsearchService } from './../elasticsearch/elasticsearch.service';
import { UpdateUserDTO } from './../dto/user/update-user';
import { CreateUserDTO } from './../dto/user/create-user';
import { UserService } from './../services/user.service';
import { LoggingInterceptor } from './../common/interceptors/logging/logging.interceptor';
import { ValidationPipe } from './../common/pipes/validation/validation.pipe';
import { AuthGuard } from './../common/guards/auth/auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  Delete,
  Query,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Controller('user')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly elasticService: ElasticsearchService,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @Get()
  findAall() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('alldoc')
  async getAllUsersFromElasticsearch() {
    const users = await this.userService.getAllUsersFromIndex();
    console.log();
    return users;
  }

  @Get('like/:id')
  async getLikedTracks(@Param('id') id: string) {
    return this.userService.getLikedTracks(id);
  }

  @Post(':id/like/:trackId')
  async addTrackToLiked(
    @Param('id') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return await this.userService.addTrackToLiked(userId, trackId);
  }

  @Delete(':id/like/:trackId')
  async removeTrackFromLiked(
    @Param('id') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return await this.userService.removeTrackFromLiked(userId, trackId);
  }
}
