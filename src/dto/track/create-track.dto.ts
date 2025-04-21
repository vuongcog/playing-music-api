import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  artist: string;

  @IsString()
  @IsOptional()
  album?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  fileUrl: string;
}
