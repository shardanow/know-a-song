import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown) {
    if (!this.schema) return value;
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map(e => e.message).join(', ');
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
