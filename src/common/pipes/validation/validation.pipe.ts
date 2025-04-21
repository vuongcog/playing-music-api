import { console } from 'node:inspector/promises';
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype) {
      throw new BadRequestException(
        'Validation failed: No valid type provided.',
      );
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object); //loi cho nay la 1

    if (errors.length > 0) {
      console.log();
      throw new BadRequestException(errors);
    }

    return value;
  }
}
