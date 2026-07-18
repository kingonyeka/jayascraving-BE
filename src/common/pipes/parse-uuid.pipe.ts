import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException(
        `${metadata.data ?? 'Parameter'} is required`,
      );
    }

    if (!isUuid(value)) {
      throw new BadRequestException(
        `${metadata.data ?? 'Parameter'} must be a valid UUID, received: ${value}`,
      );
    }

    return value;
  }
}