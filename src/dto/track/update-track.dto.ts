import { CreateTrackDto } from './create-track.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}
