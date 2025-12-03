import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodType<T>) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: T, metadata: ArgumentMetadata) {
    return this.schema.parse(value);
  }
}
